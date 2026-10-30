import { kv } from 'twenty-sdk/logic-function';

import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinPersonReview } from 'src/types/linkedin-person-review.type';

export const saveLinkedinPersonReviews = async ({
  connectedAccountId,
  personReviews,
}: {
  connectedAccountId: string;
  personReviews: Record<string, LinkedinPersonReview>;
}): Promise<void> => {
  const key = getLinkedinConnectionKvKey({
    kind: 'person-reviews',
    connectedAccountId,
  });

  if (Object.keys(personReviews).length === 0) {
    await kv.delete(key);

    return;
  }

  await kv.set(key, personReviews);
};
