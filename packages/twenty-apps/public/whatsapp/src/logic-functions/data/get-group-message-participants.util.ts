import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsappIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const getGroupMessageParticipants = async ({
  accessToken,
  groupId,
}: {
  accessToken: string;
  groupId: string;
}): Promise<WhatsappIdentity[]> => {
  const { participants = [] } = await whatsappApiRequest({
    accessToken,
    endpoint: 'GET /{groupId}',
    pathParams: { groupId },
    query: { fields: 'participants' },
  });

  return participants.map(({ wa_id, user_id }) => ({ whatsAppId: wa_id, whatsAppUserId: user_id }));
};
