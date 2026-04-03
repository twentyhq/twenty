import { useEffect } from 'react';
import {
  defineFrontComponent,
  useRecordId,
  updateProgress,
  enqueueSnackbar,
  unmountFrontComponent,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

const SendPostCardsEffect = () => {
  const recordId = useRecordId();

  useEffect(() => {
    const send = async () => {
      try {
        await updateProgress(0.1);
        const client = new CoreApiClient();

        let idsToSend: string[] = [];

        if (isDefined(recordId)) {
          idsToSend = [recordId];
        } else {
          const { postCards } = await client.query({
            postCards: {
              __args: {
                filter: { status: { eq: 'DRAFT' } },
              },
              edges: { node: { id: true } },
            },
          });

          idsToSend =
            postCards?.edges?.map(
              (edge: { node: { id: string; status: true } }) => edge.node.id,
            ) ?? [];
        }

        if (idsToSend.length === 0) {
          await updateProgress(1);
          await unmountFrontComponent();
          return;
        }

        await updateProgress(0.3);

        for (let i = 0; i < idsToSend.length; i++) {
          await client.mutation({
            updatePostCard: {
              __args: {
                id: idsToSend[i],
                data: { status: 'SENT' },
              },
              id: true,
            },
          });

          await updateProgress(0.3 + (0.7 * (i + 1)) / idsToSend.length);
        }

        const count = idsToSend.length;

        await enqueueSnackbar({
          message: `${count} postcard${count > 1 ? 's' : ''} sent`,
          variant: 'success',
        });

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
