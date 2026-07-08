import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useRecordId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';

const SendPostCardsEffect = () => {
  const recordId = useRecordId();

  useEffect(() => {
    const send = async () => {
      try {
        await updateProgress(0.1);
        const client = new CoreApiClient();

        await updateProgress(0.3);

        if (recordId) {
          await client.mutation({
            updatePostCard: {
              __args: {
                id: recordId,
                data: { status: 'SENT' },
              },
              id: true,
            },
          });

          await enqueueSnackbar({
            message: `Postcard sent`,
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
  }, [recordId]);

  return null;
};

export const SEND_POST_CARDS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'a3b7c2d1-4e5f-4a8b-9c0d-1e2f3a4b5c6d';

export default defineFrontComponent({
  universalIdentifier: SEND_POST_CARDS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Send Post Cards',
  description: 'Sets postcard status to Sent',
  isHeadless: true,
  component: SendPostCardsEffect,
});
