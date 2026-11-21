import { RestApiClient } from 'twenty-client-sdk/rest';

import { LINE_QUOTA_ROUTE_PATH } from 'src/constants/line-quota-route-path.constant';
import { type LineQuota } from 'src/logic-functions/types/line-quota.type';

export const fetchLineQuota = () =>
  new RestApiClient().get<LineQuota>(`/s${LINE_QUOTA_ROUTE_PATH}`);
