import { defineLogicFunction } from 'twenty-sdk/define';
import { WHATSAPP_ACCOUNT_HEALTH_ROUTE_PATH } from 'src/constants/whatsapp-account-health-route-path.constant';
import { WHATSAPP_LOGIC_FUNCTION_GET_ACCOUNT_HEALTH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getConnectedWhatsAppBusinessAccountIds } from 'src/logic-functions/data/get-connected-whatsapp-business-account-ids.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { getWhatsAppBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { summarizeWhatsAppAnalytics } from 'src/logic-functions/data/summarize-whatsapp-analytics.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppAccountHealth } from 'src/logic-functions/types/whatsapp-account-health.type';

const ANALYTICS_PERIOD_SECONDS = 30 * 24 * 60 * 60;

const getAccountHealth = async (whatsAppBusinessAccountId: string): Promise<WhatsAppAccountHealth> => {
  const accessToken = await getWhatsAppAccessTokenOrThrow({ whatsAppBusinessAccountId });
  const [account, phoneNumbers] = await Promise.all([
    whatsAppApiRequest({
      accessToken,
      endpoint: 'GET /{wabaId}',
      pathParams: { wabaId: whatsAppBusinessAccountId },
      query: { fields: 'name,currency' },
    }),
    getWhatsAppBusinessAccountPhoneNumbers({ accessToken, whatsAppBusinessAccountId }),
  ]);

  const end = Math.floor(Date.now() / 1000);
  const start = end - ANALYTICS_PERIOD_SECONDS;
  let last30Days: WhatsAppAccountHealth['last30Days'];

  // analytics need extra permissions on some accounts, and their absence should not hide the phone numbers
  try {
    last30Days = summarizeWhatsAppAnalytics({
      ...(await whatsAppApiRequest({
        accessToken,
        endpoint: 'GET /{wabaId}',
        pathParams: { wabaId: whatsAppBusinessAccountId },
        query: {
          fields: `analytics.start(${start}).end(${end}).granularity(DAY),pricing_analytics.start(${start}).end(${end}).granularity(DAILY)`,
        },
      })),
      currency: account.currency,
    });
  } catch (error) {
    last30Days = { error: error instanceof Error ? error.message : String(error) };
  }

  return {
    whatsAppBusinessAccountId,
    name: account.name ?? whatsAppBusinessAccountId,
    phoneNumbers: phoneNumbers.map((phoneNumber) => ({
      displayPhoneNumber: phoneNumber.display_phone_number,
      verifiedName: phoneNumber.verified_name,
      qualityRating: phoneNumber.quality_rating,
      messagingLimitTier: phoneNumber.messaging_limit_tier ?? null,
      status: phoneNumber.status ?? null,
      nameStatus: phoneNumber.name_status ?? null,
    })),
    last30Days,
  };
};

const handler = async (): Promise<{ accounts: WhatsAppAccountHealth[] }> => ({
  accounts: await Promise.all((await getConnectedWhatsAppBusinessAccountIds()).map(getAccountHealth)),
});

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_GET_ACCOUNT_HEALTH_UNIVERSAL_IDENTIFIER,
  name: 'get-account-health',
  description:
    'Returns the quality rating and messaging limit of each connected WhatsApp phone number, with 30 day message and cost totals',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: { path: WHATSAPP_ACCOUNT_HEALTH_ROUTE_PATH, httpMethod: 'GET', isAuthRequired: true },
});
