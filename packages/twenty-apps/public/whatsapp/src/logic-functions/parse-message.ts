import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from "twenty-client-sdk/core";
import {
  WhatsappWebhookMessageBusinessData,
  WhatsAppWebhookMessageContacts,
  WhatsAppWebhookMessageContent
} from "src/logic-functions/types/whatsapp-webhook-message.type";
import { findPersonByFilter } from "src/logic-functions/data/find-person-by-filter.util";
import { createPerson } from "src/logic-functions/data/create-person.util";
import { getGroupMessageParticipants } from "src/logic-functions/data/get-group-message-participants.util";
import { WhatsappFile } from "src/logic-functions/types/whatsapp-file.type";
import { updateMessage } from "src/logic-functions/data/update-message.util";
import { findMessageById } from "src/logic-functions/data/find-message-by-id.util";
import { updatePerson } from "src/logic-functions/data/update-person.util";
import {
  type IngestMessageParticipant,
  ingestMessages,
  uploadMessageAttachment
} from "twenty-sdk/logic-function";
import { findMessageChannelIdByDisplayPhoneNumber } from "src/logic-functions/data/find-message-channel-id-by-display-phone-number.util";
import { findWhatsappMessageThread } from "src/logic-functions/data/find-whatsapp-message-thread.util";
import { downloadWhatsAppFile } from "src/logic-functions/data/download-file.util";
import { uploadFile } from "src/logic-functions/data/upload-file.util";
import { getFileExtension } from "src/logic-functions/data/get-file-extension.util";
import { WHATSAPP_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

const handler = async (params: {
  businessData: WhatsappWebhookMessageBusinessData,
  contacts: WhatsAppWebhookMessageContacts,
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
  const messageChannelId = await findMessageChannelIdByDisplayPhoneNumber(businessData.display_phone_number);
  if (!messageChannelId) {
    console.error()
    return;
  }
  // find a thread by whatsapp id, if group id is present, use that
  let messageThread: string = messages.group_id ?? await findWhatsappMessageThread(coreClient);
  if (!messageThread) {
    console.error();
    return;
  }

  const participants: IngestMessageParticipant[] = [];
  participants.push({
    role: "TO",
    handle: businessData.display_phone_number,
    displayName: '',
  })
  let whatsAppPerson = await findPersonByFilter(coreClient, contacts.wa_id);
  if (!whatsAppPerson.people?.totalCount || whatsAppPerson.people?.totalCount === 0) {
    await createPerson(coreClient, contacts.wa_id, messages.from, contacts.profile.name);
    whatsAppPerson = await findPersonByFilter(coreClient, contacts.wa_id);
  }
  if (!whatsAppPerson.people?.edges[0].node) {
    return;
  }
  participants.push({
    role: "FROM",
    handle: messages.from,
    displayName: contacts.profile.name,
    personId: whatsAppPerson.people.edges[0].node.id
  })
  if (messages.group_id) {
    const groupParticipants = await getGroupMessageParticipants(messages.group_id);
    for (const groupParticipant of groupParticipants) {
      whatsAppPerson = await findPersonByFilter(coreClient, groupParticipant);
      if (!whatsAppPerson) {
        await createPerson(coreClient, groupParticipant);
      }
      participants.push({
        role: 'TO',
        handle: '',
        displayName: '',
        personId: ''
      })
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
      // TODO: when contacts send, create a new Person record or message?
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
    case 'edit': {
      await updateMessage(coreClient, messages.edit.original_message_id, messages.edit.message.image.caption ?? '');
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
    case 'reaction': {
      // TODO: implement or skip?
      break;
    }
    case "revoke": {
      const { message } = await findMessageById(coreClient, messages.revoke.original_message_id);
      if (!message?.text) return;
      await updateMessage(coreClient, messages.revoke.original_message_id, message.text.concat(` (deleted at ${messages.timestamp})`,));
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
    case 'system': {
      await updatePerson(coreClient, whatsAppPerson.people?.edges[0].node.id, messages.system.body, messages.system.wa_id);
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
    const { fileBuffer } = await downloadWhatsAppFile(file.mediaId);
    messageAttachment = [await uploadMessageAttachment({
      filename: file.fileName,
      content: fileBuffer
    })];
  }
  await ingestMessages({
    messageChannelId,
    messages: [{
      externalId: messages.id,
      threadExternalId: messageThread,
      text,
      participants: participants,
      receivedAt: new Date(messages.timestamp),
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
