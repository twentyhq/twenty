import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from "twenty-client-sdk/core";
import {
  WhatsappWebhookMessageBusinessData,
  WhatsAppWebhookMessageContacts,
  WhatsAppWebhookMessageContent
} from "src/logic-functions/types/whatsapp-webhook-message.type";
import { createPerson } from "src/logic-functions/data/create-person.util";
import { findPersonIdsByWhatsappIds } from "src/logic-functions/data/find-person-ids-by-whatsapp-ids.util";
import { getGroupMessageParticipants } from "src/logic-functions/data/get-group-message-participants.util";
import { WhatsappFile } from "src/logic-functions/types/whatsapp-file.type";
import { updateMessage } from "src/logic-functions/data/update-message.util";
import { findMessageByExternalId } from "src/logic-functions/data/find-message-by-external-id.util";
import { updatePersonWhatsappNumber } from "src/logic-functions/data/update-person-whatsapp-number.util";
import { getEditedMessageText } from "src/logic-functions/data/get-edited-message-text.util";
import { formatSharedContactsText } from "src/logic-functions/data/format-shared-contacts-text.util";
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
    if (
      messages.system.type === 'user_changed_number' &&
      isNonEmptyString(messages.from) &&
      isNonEmptyString(messages.system.wa_id)
    ) {
      await updatePersonWhatsappNumber({
        client: coreClient,
        previousWhatsAppId: messages.from,
        whatsAppId: messages.system.wa_id,
      });
    }
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
  const customerWhatsAppId = contacts.wa_id;
  const threadExternalId = messages.group_id ?? customerWhatsAppId;
  // history imports include messages the business sent, with the business number as sender
  const isSentByBusiness =
    normalizeWhatsappPhoneNumber(messages.from) ===
    normalizeWhatsappPhoneNumber(businessData.display_phone_number);

  const customerPersonId =
    (await findPersonIdsByWhatsappIds({ client: coreClient, whatsAppIds: [customerWhatsAppId] })).get(customerWhatsAppId) ??
    (await createPerson({
      client: coreClient,
      whatsAppId: customerWhatsAppId,
      phoneNumber: customerWhatsAppId,
      name: contacts.profile.name,
    }));

  const businessParticipant = { handle: businessData.display_phone_number };
  const customerParticipant = {
    handle: customerWhatsAppId,
    displayName: isNonEmptyString(contacts.profile.name) ? contacts.profile.name : undefined,
    personId: customerPersonId,
  };
  const participants: IngestMessageParticipant[] = isSentByBusiness
    ? [{ role: 'FROM', ...businessParticipant }, { role: 'TO', ...customerParticipant }]
    : [{ role: 'FROM', ...customerParticipant }, { role: 'TO', ...businessParticipant }];

  if (isDefined(messages.group_id)) {
    const businessWhatsAppId = normalizeWhatsappPhoneNumber(businessData.display_phone_number);
    const groupParticipantWhatsAppIds = (
      await getGroupMessageParticipants({ accessToken, groupId: messages.group_id })
    ).filter(
      (whatsAppId) => whatsAppId !== customerWhatsAppId && whatsAppId !== businessWhatsAppId,
    );
    const groupParticipantPersonIds = await findPersonIdsByWhatsappIds({
      client: coreClient,
      whatsAppIds: groupParticipantWhatsAppIds,
    });

    for (const whatsAppId of groupParticipantWhatsAppIds) {
      participants.push({
        role: 'TO',
        handle: whatsAppId,
        personId: groupParticipantPersonIds.get(whatsAppId),
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
      // TODO: check
      text = messages.interactive.type === 'list_reply' ? `${messages.interactive?.list_reply?.title} - ${messages.interactive?.list_reply?.description}` : <string>messages.interactive?.button_reply?.title;
      break;
    }
    case 'location': {
      text = `Place: ${messages.location?.name}\nAddress: ${messages.location?.address}\nLat: ${messages.location?.latitude}\nLong: ${messages.location?.longitude}\nURL: <a href='${messages.location?.url}'>${messages.location?.url}</a>`;
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
