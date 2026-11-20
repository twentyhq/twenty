import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_GROUP_PARTICIPANTS_CACHE_TTL_MS } from 'src/constants/whatsapp-group-participants-cache-ttl-ms.constant';
import { WHATSAPP_KV_KEY_PREFIXES } from 'src/constants/whatsapp-kv-key-prefixes.constant';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

type CachedGroupParticipants = {
  fetchedAt: number;
  participants: WhatsAppIdentity[];
};

export const getGroupMessageParticipants = async ({
  accessToken,
  groupId,
}: {
  accessToken: string;
  groupId: string;
}): Promise<WhatsAppIdentity[]> => {
  const key = `${WHATSAPP_KV_KEY_PREFIXES.groupParticipants}${groupId}`;
  const cachedGroupParticipants = await kv.get<CachedGroupParticipants>(key);

  if (
    cachedGroupParticipants !== null &&
    Date.now() - cachedGroupParticipants.fetchedAt < WHATSAPP_GROUP_PARTICIPANTS_CACHE_TTL_MS
  ) {
    return cachedGroupParticipants.participants;
  }

  const { participants = [] } = await whatsAppApiRequest({
    accessToken,
    endpoint: 'GET /{groupId}',
    pathParams: { groupId },
    query: { fields: 'participants' },
  });

  const groupParticipants = participants.map(({ wa_id, user_id }) => ({
    whatsAppId: wa_id,
    whatsAppUserId: user_id,
  }));

  await kv.set(key, { fetchedAt: Date.now(), participants: groupParticipants });

  return groupParticipants;
};
