import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useRecordId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

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

export default defineFrontComponent({
  universalIdentifier: 'a3b7c2d1-4e5f-4a8b-9c0d-1e2f3a4b5c6d',
  name: 'Send Post Cards',
  description: 'Sets postcard status to Sent',
  isHeadless: true,
  component: SendPostCardsEffect,
  command: {
    universalIdentifier: 'bd75de13-87a1-4f7a-94e2-92e19e97523c',
    label: 'Send post cards',
    shortLabel: 'Send',
    icon: 'IconSend',
    isPinned: true,
    availabilityType: 'RECORD_SELECTION',
    availabilityObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  },
});
