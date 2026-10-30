import { kv } from 'twenty-sdk/logic-function';

import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinPersonReview } from 'src/types/linkedin-person-review.type';

export const getLinkedinPersonReviews = async (
  connectedAccountId: string,
): Promise<Record<string, LinkedinPersonReview>> =>
  (await kv.get<Record<string, LinkedinPersonReview>>(
    getLinkedinConnectionKvKey({ kind: 'person-reviews', connectedAccountId }),
  )) ?? {};
