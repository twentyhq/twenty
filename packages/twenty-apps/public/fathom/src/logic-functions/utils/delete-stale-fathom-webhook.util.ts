import { type Fathom } from 'fathom-typescript';

import { isFathomNotFoundError } from 'src/logic-functions/utils/is-fathom-not-found-error.util';

// A webhook Fathom already dropped is the only failure safe to move past:
// anything else would orphan the old webhook once it is replaced.
export const deleteStaleFathomWebhook = async ({
  fathomClient,
  webhookId,
}: {
  fathomClient: Fathom;
  webhookId: string;
}): Promise<void> => {
  try {
    await fathomClient.deleteWebhook({ id: webhookId });
  } catch (error) {
    if (!isFathomNotFoundError(error)) {
      throw error;
    }
  }
};
