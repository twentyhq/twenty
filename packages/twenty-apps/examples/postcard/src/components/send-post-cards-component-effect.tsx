import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';

const SendPostCardsEffect = () => {
  const selectedRecordIds = useSelectedRecordIds();

  useEffect(() => {
    const send = async () => {
      try {
        await updateProgress(0.1);
        const client = new CoreApiClient();

        await updateProgress(0.3);

        if (selectedRecordIds.length > 0) {
          await client.mutation({
            updatePostCards: {
              __args: {
                filter: { id: { in: selectedRecordIds } },
                data: { status: 'SENT' },
              },
              id: true,
            },
          });

          await enqueueSnackbar({
            message:
              selectedRecordIds.length === 1
                ? 'Postcard sent'
                : `${selectedRecordIds.length} postcards sent`,
            variant: 'success',
          });
        }

        await unmountFrontComponent();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to send postcards';

        await enqueueSnackbar({ message, variant: 'error' });
        await unmountFrontComponent();
      }
    };

    send();
  }, [selectedRecordIds]);

  return null;
};

export const SEND_POST_CARDS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'a3b7c2d1-4e5f-4a8b-9c0d-1e2f3a4b5c6d';

export default defineFrontComponent({
  universalIdentifier: SEND_POST_CARDS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Send Post Cards',
  description: 'Sets the selected postcards to Sent',
  isHeadless: true,
  component: SendPostCardsEffect,
});
