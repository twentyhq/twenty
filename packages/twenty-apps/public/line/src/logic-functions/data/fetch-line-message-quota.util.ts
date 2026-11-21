import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';

type QuotaResponse = { type: 'none' } | { type: 'limited'; value: number };

// https://developers.line.biz/en/reference/messaging-api/#get-quota
export const fetchLineMessageQuota = async (
  accessToken: string,
): Promise<{ limit: number | null; used: number }> => {
  const [quota, { totalUsage }] = await Promise.all([
    lineApiRequest<QuotaResponse>({
      accessToken,
      method: 'GET',
      path: '/v2/bot/message/quota',
    }),
    lineApiRequest<{ totalUsage: number }>({
      accessToken,
      method: 'GET',
      path: '/v2/bot/message/quota/consumption',
    }),
  ]);

  return {
    limit: quota.type === 'limited' ? quota.value : null,
    used: totalUsage,
  };
};
