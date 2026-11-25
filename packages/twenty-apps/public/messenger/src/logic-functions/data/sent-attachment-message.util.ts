import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';

const buildSentAttachmentMessageKey = (mid: string) =>
  `${MESSENGER_KV_KEY_PREFIXES.sentAttachmentMessageByMid}${mid}`;

// a reply from Twenty is stored as one message, but Messenger sends each attachment as its own message with its own mid
export const rememberSentAttachmentMessages = async (mids: string[]) => {
  for (const mid of mids) {
    await kv.set(buildSentAttachmentMessageKey(mid), true);
  }
};

export const consumeSentAttachmentMessage = async (
  mid: string,
): Promise<boolean> => {
  const key = buildSentAttachmentMessageKey(mid);

  if (!isDefined(await kv.get<boolean>(key))) {
    return false;
  }

  await kv.delete(key);

  return true;
};
