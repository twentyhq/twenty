import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from "twenty-client-sdk/core";
import {
  WhatsappWebhookMessageBusinessData,
  WhatsAppWebhookMessageContacts,
  WhatsAppWebhookMessageContent
} from "src/logic-functions/types/whatsapp-webhook-message.type";
import { findOrCreateWhatsappPersonId } from "src/logic-functions/data/find-or-create-whatsapp-person-id.util";
import { findWhatsappPeople } from "src/logic-functions/data/find-whatsapp-people.util";
import { findPersonForWhatsappIdentity } from "src/logic-functions/data/find-person-for-whatsapp-identity.util";
import { type WhatsappIdentity } from "src/logic-functions/types/whatsapp-identity.type";
import { isSameWhatsappIdentity } from "src/logic-functions/data/is-same-whatsapp-identity.util";
import { getGroupMessageParticipants } from "src/logic-functions/data/get-group-message-participants.util";
import { WhatsappFile } from "src/logic-functions/types/whatsapp-file.type";
import { updateMessage } from "src/logic-functions/data/update-message.util";
import { findMessageByExternalId } from "src/logic-functions/data/find-message-by-external-id.util";
import { updateWhatsappPersonIdentity } from "src/logic-functions/data/update-whatsapp-person-identity.util";
import { getEditedMessageText } from "src/logic-functions/data/get-edited-message-text.util";
import { formatSharedContactsText } from "src/logic-functions/data/format-shared-contacts-text.util";
import { getInteractiveMessageText } from "src/logic-functions/data/get-interactive-message-text.util";
import { formatLocationText } from "src/logic-functions/data/format-location-text.util";
import {
  type IngestMessageParticipant,
  ingestMessages,
  uploadMessageAttachment
} from "twenty-sdk/logic-function";
import { isDefined } from "twenty-sdk/utils";
import { findMessageChannelByDisplayPhoneNumber } from "src/logic-functions/data/find-message-channel-by-display-phone-number.util";
import { getWhatsappAccessTokenOrThrow } from "src/logic-functions/data/get-whatsapp-access-token-or-throw.util";
import { normalizeWhatsappPhoneNumber } from "src/logic-functions/data/normalize-whatsapp-phone-number.util";
import { downloadWhatsAppFile } from "src/logic-functions/data/download-file.util";
import { getFileExtension } from "src/logic-functions/data/get-file-extension.util";
import { WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

const handler = async (params: {
  businessData: WhatsappWebhookMessageBusinessData,
  contacts?: WhatsAppWebhookMessageContacts,
  messages: WhatsAppWebhookMessageContent
}) => {
  const { businessData, contacts, messages } = params;
  const coreClient = new CoreApiClient();
  /*
  Questions:
     is kv better than whatsapp message thread object?
  */
  if (messages.type === 'unsupported') {
    console.warn();
    return; // not needed at time being to do anything with it, maybe when notifications will be done at some point it'll become useful
  }
  if (messages.type === 'reaction') {
    return;
  }
  if (messages.type === 'system') {
    const { system } = messages;
    await updateWhatsappPersonIdentity({
      client: coreClient,
      ...(system.type === 'user_changed_number'
        ? {
            previousIdentity: { whatsAppId: messages.from, whatsAppUserId: system.user_id },
            identity: { whatsAppId: system.wa_id },
          }
        : {
            previousIdentity: { whatsAppUserId: system.previous_user_id },
            identity: { whatsAppUserId: system.user_id },
          }),
    });
    return;
  }
  const messageChannel = await findMessageChannelByDisplayPhoneNumber(businessData.display_phone_number);
  if (!isDefined(messageChannel)) {
    throw new Error(`No WhatsApp message channel for ${businessData.display_phone_number}`);
  }
  const sentAt = new Date(parseInt(messages.timestamp, 10) * 1000);

  if (messages.type === 'edit' || messages.type === 'revoke') {
    const originalExternalId =
      messages.type === 'edit' ? messages.edit.original_message_id : messages.revoke.original_message_id;
    const originalMessage = await findMessageByExternalId({
      client: coreClient,
      messageChannelId: messageChannel.id,
      externalId: originalExternalId,
    });
    if (!isDefined(originalMessage)) {
      console.warn(`Ignoring WhatsApp ${messages.type}, original message ${originalExternalId} was never imported`);
      return;
    }
    const updatedText =
      messages.type === 'edit'
        ? getEditedMessageText(messages.edit.message)
        : [originalMessage.text, `(Deleted on ${sentAt.toISOString()})`].filter(isNonEmptyString).join('\n\n');
    await updateMessage(coreClient, originalMessage.id, updatedText);
    return;
  }

  if (!isDefined(contacts)) {
    throw new Error(`WhatsApp message ${messages.id} has no contact`);
  }
  const accessToken = await getWhatsappAccessTokenOrThrow({
    connectedAccountId: messageChannel.connectedAccountId,
  });
  const customerIdentity: WhatsappIdentity = {
    whatsAppId: contacts.wa_id,
    whatsAppUserId: contacts.user_id,
  };
  const customerHandle = contacts.wa_id ?? contacts.user_id;
  if (!isNonEmptyString(customerHandle)) {
    throw new Error(`WhatsApp message ${messages.id} has no sender phone number or user ID`);
  }
  // the user ID stays stable when a user hides or changes their phone number
  const threadExternalId = messages.group_id ?? contacts.user_id ?? customerHandle;
  // history imports include messages the business sent, with the business number as sender
  const isSentByBusiness =
    isNonEmptyString(messages.from) &&
    normalizeWhatsappPhoneNumber(messages.from) ===
      normalizeWhatsappPhoneNumber(businessData.display_phone_number);

  const customerPersonId = await findOrCreateWhatsappPersonId({
    client: coreClient,
    identity: customerIdentity,
    name: contacts.profile.name,
  });

  const businessParticipant = { handle: businessData.display_phone_number };
  const customerParticipant = {
    handle: customerHandle,
    displayName: [contacts.profile.name, contacts.username].find(isNonEmptyString),
    personId: customerPersonId,
  };
  const participants: IngestMessageParticipant[] = isSentByBusiness
    ? [{ role: 'FROM', ...businessParticipant }, { role: 'TO', ...customerParticipant }]
    : [{ role: 'FROM', ...customerParticipant }, { role: 'TO', ...businessParticipant }];

  if (isDefined(messages.group_id)) {
    const businessWhatsAppId = normalizeWhatsappPhoneNumber(businessData.display_phone_number);
    const groupParticipants = (
      await getGroupMessageParticipants({ accessToken, groupId: messages.group_id })
    ).filter(
      (participant) =>
        participant.whatsAppId !== businessWhatsAppId &&
        !isSameWhatsappIdentity(participant, customerIdentity),
    );
    const groupPeople = await findWhatsappPeople({ client: coreClient, identities: groupParticipants });

    for (const participant of groupParticipants) {
      const handle = participant.whatsAppId ?? participant.whatsAppUserId;

      if (!isNonEmptyString(handle)) {
        continue;
      }

      participants.push({
        role: 'TO',
        handle,
        personId: findPersonForWhatsappIdentity({ people: groupPeople, identity: participant })?.id,
      });
    }
  }
  let text: string = '';
  let file: WhatsappFile | undefined;
  switch (messages.type) {
    case 'audio': {
      file = {
        fileName: 'audio_'.concat(messages.timestamp, getFileExtension(messages.audio.mime_type)),
        mimeType: messages.audio.mime_type,
        mediaId: messages.audio.id,
      }
      break;
    }
    case 'button': {
      text = messages.button.text;
      break;
    }
    case 'contacts': {
      text = formatSharedContactsText(messages.contacts ?? []);
      break;
    }
    case 'document': {
      text = messages.document.caption ?? '';
      file = {
        fileName: messages.document.filename ?? 'document_'.concat(messages.timestamp, getFileExtension(messages.document.mime_type)),
        mimeType: messages.document.mime_type,
        mediaId: messages.document.id,
      }
      break;
    }
    case 'image': {
      text = messages.image.caption ?? '';
      file = {
        fileName: 'image_'.concat(messages.timestamp, getFileExtension(messages.image.mime_type)),
        mimeType: messages.image.mime_type,
        mediaId: messages.image.id,
      }
      break;
    }
    case 'interactive': {
      text = getInteractiveMessageText(messages.interactive);
      break;
    }
    case 'location': {
      text = formatLocationText(messages.location);
      break;
    }
    case 'order': {
      text = messages.order.text; // TODO ???
      break;
    }
    case 'sticker': {
      file = {
        fileName: 'sticker_'.concat(messages.timestamp, getFileExtension(messages.sticker.mime_type)),
        mimeType: messages.sticker.mime_type,
        mediaId: messages.sticker.id,
      }
      break;
    }
    case 'text': {
      text = messages.text.body;
      break;
    }
    case 'video': {
      text = messages.video.caption ?? '';
      file = {
        fileName: 'video_'.concat(messages.timestamp, getFileExtension(messages.video.mime_type)),
        mimeType: messages.video.mime_type,
        mediaId: messages.video.id,
      }
      break;
    }
    default: {
      return;
    }
  }
  let messageAttachment = undefined;
  if (file) {
    const { fileBuffer } = await downloadWhatsAppFile({ accessToken, mediaId: file.mediaId });
    messageAttachment = [await uploadMessageAttachment({
      filename: file.fileName,
      content: fileBuffer
    })];
  }
  await ingestMessages({
    messageChannelId: messageChannel.id,
    messages: [{
      externalId: messages.id,
      threadExternalId,
      text,
      participants: participants,
      receivedAt: sentAt,
      attachments: messageAttachment,
    }]
  })
}

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'parse-message',
  description: 'Parses webhook and adds message',
  timeoutSeconds: 900,
  handler,
});
