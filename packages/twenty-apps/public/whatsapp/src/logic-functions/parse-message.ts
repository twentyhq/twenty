import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from "twenty-client-sdk/core";
import { type ParseMessagePayload } from "src/logic-functions/types/parse-message-payload.type";
import { findOrCreateWhatsAppPersonId } from "src/logic-functions/data/find-or-create-whatsapp-person-id.util";
import { findWhatsAppPeople } from "src/logic-functions/data/find-whatsapp-people.util";
import { findPersonForWhatsAppIdentity } from "src/logic-functions/data/find-person-for-whatsapp-identity.util";
import { type WhatsAppIdentity } from "src/logic-functions/types/whatsapp-identity.type";
import { isSameWhatsAppIdentity } from "src/logic-functions/data/is-same-whatsapp-identity.util";
import { getGroupMessageParticipants } from "src/logic-functions/data/get-group-message-participants.util";
import { WhatsAppFile } from "src/logic-functions/types/whatsapp-file.type";
import { updateMessage } from "src/logic-functions/data/update-message.util";
import { findMessageByExternalId } from "src/logic-functions/data/find-message-by-external-id.util";
import { updateWhatsAppPersonIdentity } from "src/logic-functions/data/update-whatsapp-person-identity.util";
import { getEditedMessageText } from "src/logic-functions/data/get-edited-message-text.util";
import { formatSharedContactsText } from "src/logic-functions/data/format-shared-contacts-text.util";
import { getInteractiveMessageText } from "src/logic-functions/data/get-interactive-message-text.util";
import { formatLocationText } from "src/logic-functions/data/format-location-text.util";
import { type IngestMessageParticipant, ingestMessages, kv } from "twenty-sdk/logic-function";
import { isDefined } from "twenty-sdk/utils";
import { findOrCreateWhatsAppMessageChannelOrThrow } from "src/logic-functions/data/find-or-create-whatsapp-message-channel-or-throw.util";
import { parseWhatsAppTimestamp } from "src/logic-functions/data/parse-whatsapp-timestamp.util";
import { findWhatsAppCampaignIdsInThread } from "src/logic-functions/data/find-whatsapp-campaign-ids-in-thread.util";
import { scheduleWhatsAppCampaignRefresh } from "src/logic-functions/data/schedule-whatsapp-campaign-refresh.util";
import { resolveWhatsAppThreadExternalId } from "src/logic-functions/data/resolve-whatsapp-thread-external-id.util";
import { buildRevokedMessageText } from "src/logic-functions/data/build-revoked-message-text.util";
import { uploadWhatsAppMediaAttachmentOnce } from "src/logic-functions/data/upload-whatsapp-media-attachment-once.util";
import { WHATSAPP_KV_KEY_PREFIXES } from "src/constants/whatsapp-kv-key-prefixes.constant";
import { WHATSAPP_HISTORY_MEDIA_RETENTION_MS } from "src/constants/whatsapp-history-media-retention-ms.constant";
import { getWhatsAppAccessTokenOrThrow } from "src/logic-functions/data/get-whatsapp-access-token-or-throw.util";
import { normalizeWhatsAppPhoneNumber } from "src/logic-functions/data/normalize-whatsapp-phone-number.util";
import { getFileExtension } from "src/logic-functions/data/get-file-extension.util";
import { WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

const handler = async ({
  whatsAppBusinessAccountId,
  businessData,
  contacts,
  messages,
}: ParseMessagePayload) => {
  const coreClient = new CoreApiClient();
  if (messages.type === 'unsupported') {
    console.warn(`Ignoring unsupported WhatsApp message ${messages.id}`);
    return;
  }
  if (messages.type === 'reaction') {
    return;
  }
  if (messages.type === 'system') {
    const { system } = messages;
    await updateWhatsAppPersonIdentity({
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
  const messageChannel = await findOrCreateWhatsAppMessageChannelOrThrow({
    whatsAppBusinessAccountId,
    displayPhoneNumber: businessData.display_phone_number,
  });
  const sentAt = parseWhatsAppTimestamp(messages.timestamp);

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
        : buildRevokedMessageText({ originalText: originalMessage.text, revokedAt: sentAt });
    await updateMessage({ client: coreClient, messageId: originalMessage.id, text: updatedText });
    return;
  }

  // Meta retries and duplicates deliveries, and a history import can repeat live messages
  const alreadyImportedMessage = await findMessageByExternalId({
    client: coreClient,
    messageChannelId: messageChannel.id,
    externalId: messages.id,
  });
  if (isDefined(alreadyImportedMessage)) {
    return;
  }

  if (
    messages.type === 'media_placeholder' &&
    Date.now() - sentAt.getTime() < WHATSAPP_HISTORY_MEDIA_RETENTION_MS
  ) {
    return;
  }

  if (!isDefined(contacts)) {
    throw new Error(`WhatsApp message ${messages.id} has no contact`);
  }
  const accessToken = await getWhatsAppAccessTokenOrThrow({
    connectedAccountId: messageChannel.connectedAccountId,
  });
  const customerIdentity: WhatsAppIdentity = {
    whatsAppId: contacts.wa_id,
    whatsAppUserId: contacts.user_id,
  };
  const customerHandle = contacts.wa_id ?? contacts.user_id;
  if (!isNonEmptyString(customerHandle)) {
    throw new Error(`WhatsApp message ${messages.id} has no sender phone number or user ID`);
  }
  const threadExternalId =
    (await resolveWhatsAppThreadExternalId({
      messageChannelId: messageChannel.id,
      groupId: messages.group_id,
      customerIdentity,
    })) ?? customerHandle;
  // history imports include messages the business sent, with the business number as sender
  const isSentByBusiness =
    isNonEmptyString(messages.from) &&
    normalizeWhatsAppPhoneNumber(messages.from) ===
      normalizeWhatsAppPhoneNumber(businessData.display_phone_number);

  const customerPersonId = await findOrCreateWhatsAppPersonId({
    client: coreClient,
    identity: customerIdentity,
    name: contacts.profile.name,
  });

  // Twenty marks a message outgoing only when its sender handle is exactly the channel handle
  const businessParticipant = { handle: messageChannel.handle };
  const customerParticipant = {
    handle: customerHandle,
    displayName: [contacts.profile.name, contacts.username].find(isNonEmptyString),
    personId: customerPersonId,
  };
  const participants: IngestMessageParticipant[] = isSentByBusiness
    ? [{ role: 'FROM', ...businessParticipant }, { role: 'TO', ...customerParticipant }]
    : [{ role: 'FROM', ...customerParticipant }, { role: 'TO', ...businessParticipant }];

  if (isDefined(messages.group_id)) {
    const businessWhatsAppId = normalizeWhatsAppPhoneNumber(businessData.display_phone_number);
    const groupParticipants = (
      await getGroupMessageParticipants({ accessToken, groupId: messages.group_id })
    ).filter(
      (participant) =>
        participant.whatsAppId !== businessWhatsAppId &&
        !isSameWhatsAppIdentity(participant, customerIdentity),
    );
    const groupPeople = await findWhatsAppPeople({ client: coreClient, identities: groupParticipants });

    for (const participant of groupParticipants) {
      const handle = participant.whatsAppId ?? participant.whatsAppUserId;

      if (!isNonEmptyString(handle)) {
        continue;
      }

      participants.push({
        role: 'TO',
        handle,
        personId: findPersonForWhatsAppIdentity({ people: groupPeople, identity: participant })?.id,
      });
    }
  }
  let text: string = '';
  let file: WhatsAppFile | undefined;
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
      text = messages.order.text;
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
    case 'media_placeholder': {
      text = '[Media no longer available from WhatsApp]';
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
  const attachments = isDefined(file)
    ? [await uploadWhatsAppMediaAttachmentOnce({ accessToken, messageId: messages.id, file })]
    : undefined;

  await ingestMessages({
    messageChannelId: messageChannel.id,
    messages: [{
      externalId: messages.id,
      threadExternalId,
      text,
      participants,
      receivedAt: sentAt,
      attachments,
    }]
  });

  if (isDefined(attachments)) {
    await kv.delete(`${WHATSAPP_KV_KEY_PREFIXES.messageAttachment}${messages.id}`);
  }

  // a customer reply counts towards the campaigns that reached this conversation
  if (!isSentByBusiness) {
    const campaignIds = await findWhatsAppCampaignIdsInThread({ messageChannelId: messageChannel.id, threadExternalId });

    if (campaignIds.length > 0) {
      await scheduleWhatsAppCampaignRefresh(campaignIds);
    }
  }
}

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'parse-message',
  description: 'Imports one WhatsApp message into its conversation, linking or creating the sender',
  timeoutSeconds: 900,
  handler,
});
