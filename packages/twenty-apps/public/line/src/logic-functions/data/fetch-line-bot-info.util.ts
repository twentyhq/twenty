import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';
import { type LineBotInfo } from 'src/logic-functions/types/line-bot-info.type';

export const fetchLineBotInfo = (accessToken: string) =>
  lineApiRequest<LineBotInfo>({
    accessToken,
    method: 'GET',
    path: '/v2/bot/info',
  });
