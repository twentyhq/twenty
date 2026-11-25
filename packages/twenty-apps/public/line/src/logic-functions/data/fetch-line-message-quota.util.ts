import { isNumber, isObject } from '@sniptt/guards';

import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';

type QuotaResponse = { type: 'none' } | { type: 'limited'; value: number };

const isQuotaResponse = (body: unknown): body is QuotaResponse =>
  isObject(body) &&
  'type' in body &&
  (body.type === 'none' ||
    (body.type === 'limited' && 'value' in body && isNumber(body.value)));

const isQuotaConsumption = (body: unknown): body is { totalUsage: number } =>
  isObject(body) && 'totalUsage' in body && isNumber(body.totalUsage);

// https://developers.line.biz/en/reference/messaging-api/#get-quota
export const fetchLineMessageQuota = async (
  accessToken: string,
): Promise<{ limit: number | null; used: number }> => {
  const [quota, { totalUsage }] = await Promise.all([
    lineApiRequest({
      accessToken,
      method: 'GET',
      path: '/v2/bot/message/quota',
      isExpectedResponse: isQuotaResponse,
    }),
    lineApiRequest({
      accessToken,
      method: 'GET',
      path: '/v2/bot/message/quota/consumption',
      isExpectedResponse: isQuotaConsumption,
    }),
  ]);

  return {
    limit: quota.type === 'limited' ? quota.value : null,
    used: totalUsage,
  };
};
