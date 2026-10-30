import { getLinkedinPersonReviews } from 'src/logic-functions/utils/get-linkedin-person-reviews.util';
import { saveLinkedinPersonReviews } from 'src/logic-functions/utils/save-linkedin-person-reviews.util';
import { type LinkedinPersonReview } from 'src/types/linkedin-person-review.type';

export const recordLinkedinPersonReview = async ({
  connectedAccountId,
  personReview,
}: {
  connectedAccountId: string;
  personReview: LinkedinPersonReview;
}): Promise<void> => {
  const personReviews = await getLinkedinPersonReviews(connectedAccountId);
  const existingPersonReview = personReviews[personReview.handle];

  const lastMessageAt =
    existingPersonReview?.lastMessageAt !== undefined &&
    existingPersonReview.lastMessageAt > personReview.lastMessageAt
      ? existingPersonReview.lastMessageAt
      : personReview.lastMessageAt;

  await saveLinkedinPersonReviews({
    connectedAccountId,
    personReviews: {
      ...personReviews,
      [personReview.handle]: { ...personReview, lastMessageAt },
    },
  });
};
