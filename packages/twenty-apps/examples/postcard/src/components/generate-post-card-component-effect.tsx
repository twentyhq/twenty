import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';

const SYSTEM_PROMPT =
  'You are a postcard writing assistant. Write a short, warm postcard message ' +
  'under 150 words. Use a personal tone. Output ONLY the postcard message ' +
  'text, nothing else — no greeting label, no sign-off label, just the message.';

const NO_AI_MODEL_MESSAGE =
  'No AI models configured. Go to Settings > Admin Panel > AI to add a provider API key.';

type GenerateTextResponse = {
  text: string;
};

type RestErrorBody = {
  code?: string;
};

const isNoAiModelError = (error: unknown) =>
  error instanceof RestApiClientError &&
  (error.body as RestErrorBody | undefined)?.code === 'API_KEY_NOT_CONFIGURED';

const GeneratePostCardEffect = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const recordId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;

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
        const restClient = new RestApiClient();
        const coreClient = new CoreApiClient();

        const { text } = await restClient.post<GenerateTextResponse>(
          '/rest/ai/generate-text',
          {
            systemPrompt: SYSTEM_PROMPT,
            userPrompt: 'Write a postcard message for a friend.',
          },
        );

        await updateProgress(0.7);

        await coreClient.mutation({
          updatePostCard: {
            __args: {
              id: recordId,
              data: { content: text },
            },
            id: true,
          },
        });

        await updateProgress(1);

        await enqueueSnackbar({
          message: 'Post card content generated!',
          variant: 'success',
        });

        await unmountFrontComponent();
      } catch (error) {
        await enqueueSnackbar({
          message: isNoAiModelError(error)
            ? NO_AI_MODEL_MESSAGE
            : error instanceof Error
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
