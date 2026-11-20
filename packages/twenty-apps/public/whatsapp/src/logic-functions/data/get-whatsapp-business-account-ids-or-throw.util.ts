import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

const WHATSAPP_BUSINESS_MANAGEMENT_SCOPE = 'whatsapp_business_management';

// https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/manage-accounts
export const getWhatsAppBusinessAccountIdsOrThrow = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const { data } = await whatsAppApiRequest({
    accessToken,
    endpoint: 'GET /debug_token',
    query: { input_token: accessToken },
  });

  if (!data.is_valid) {
    throw new Error('The WhatsApp access token is invalid or expired');
  }

  const whatsAppBusinessAccountIds =
    data.granular_scopes.find(({ scope }) => scope === WHATSAPP_BUSINESS_MANAGEMENT_SCOPE)
      ?.target_ids ?? [];

  if (whatsAppBusinessAccountIds.length === 0) {
    throw new Error(
      `The WhatsApp access token needs the ${WHATSAPP_BUSINESS_MANAGEMENT_SCOPE} permission on at least one WhatsApp Business Account`,
    );
  }

  return { userId: data.user_id, whatsAppBusinessAccountIds };
};
