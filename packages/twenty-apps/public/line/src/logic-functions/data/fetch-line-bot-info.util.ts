import { isNonEmptyString, isObject } from '@sniptt/guards';

import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';
import { type LineBotInfo } from 'src/logic-functions/types/line-bot-info.type';

const isLineBotInfo = (body: unknown): body is LineBotInfo =>
  isObject(body) &&
  'userId' in body &&
  isNonEmptyString(body.userId) &&
  'basicId' in body &&
  isNonEmptyString(body.basicId) &&
  'displayName' in body &&
  isNonEmptyString(body.displayName);

export const fetchLineBotInfo = (accessToken: string) =>
  lineApiRequest({
    accessToken,
    method: 'GET',
    path: '/v2/bot/info',
    isExpectedResponse: isLineBotInfo,
  });
