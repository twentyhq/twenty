import { subscribePage } from 'src/logic-functions/data/subscribe-page.util';
import { type MessengerPage } from 'src/logic-functions/types/messenger-page.type';

// one Page Meta refuses must not keep the others from receiving messages
export const subscribePages = async (pages: MessengerPage[]) => {
  const failures: { page: MessengerPage; reason: string }[] = [];

  for (const page of pages) {
    try {
      await subscribePage({ pageId: page.id, pageAccessToken: page.access_token });
    } catch (error) {
      failures.push({
        page,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return failures;
};
