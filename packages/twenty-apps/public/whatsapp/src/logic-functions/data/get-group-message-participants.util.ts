import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const getGroupMessageParticipants = async ({
  accessToken,
  groupId,
}: {
  accessToken: string;
  groupId: string;
}): Promise<string[]> => {
  const { participants = [] } = await whatsappApiRequest({
    accessToken,
    endpoint: 'GET /{groupId}',
    pathParams: { groupId },
    query: { fields: 'participants' },
  });

  return participants.map(({ wa_id }) => wa_id);
};
