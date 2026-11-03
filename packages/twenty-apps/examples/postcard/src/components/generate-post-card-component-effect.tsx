import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useRecordId,
} from 'twenty-sdk/front-component';
import { RestApiClient } from 'twenty-client-sdk/rest';

const GeneratePostCardEffect = () => {
  const recordId = useRecordId();

  useEffect(() => {
    if (recordId === null) {
      enqueueSnackbar({
        message: 'Please select exactly one record',
        variant: 'error',
      });
      unmountFrontComponent();
      return;
    }

    const generate = async () => {
      try {
        const result = await new RestApiClient().post<{
          success: boolean;
          error?: string;
        }>('/s/post-cards/generate', { recordId });

        if (!result.success) {
          throw new Error(result.error ?? 'Failed to generate content');
        }

        await updateProgress(1);

        await enqueueSnackbar({
          message: 'Post card content generated!',
          variant: 'success',
        });

        await unmountFrontComponent();
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to generate content',
          variant: 'error',
        });
        await unmountFrontComponent();
      }
    };

    generate();
  }, [recordId]);

  return null;
};

export const GENERATE_POST_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'bd7649c0-7540-4267-ac4b-f062fbd635a3';

export default defineFrontComponent({
  universalIdentifier: GENERATE_POST_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Generate Post Card',
  description: 'Generates postcard content using AI',
  isHeadless: true,
  component: GeneratePostCardEffect,
});
