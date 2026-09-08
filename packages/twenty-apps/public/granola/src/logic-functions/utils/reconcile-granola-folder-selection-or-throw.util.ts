import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import { type GranolaPendingFolderSelection } from 'src/logic-functions/types/granola-pending-folder-selection.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';

export const reconcileGranolaFolderSelectionOrThrow =
  async (): Promise<void> => {
    const pending = await kv.get<GranolaPendingFolderSelection>(
      GRANOLA_PENDING_FOLDER_SELECTION_KEY,
    );

    if (!isDefined(pending)) {
      return;
    }

    const registration = await findGranolaRegistrationForCurrentKey();

    if (!isDefined(registration)) {
      throw new Error(
        'Re-register the webhook after changing the Granola key.',
      );
    }

    const endpoint = await createGranolaClientOrThrow().updateWebhookEndpoint({
      webhookEndpointId: registration.webhookEndpointId,
      folder_ids: pending.folderIds,
    });

    await kv.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, {
      ...registration,
      folderIds: endpoint.folder_ids,
    });
    await kv.delete(GRANOLA_PENDING_FOLDER_SELECTION_KEY);
  };
