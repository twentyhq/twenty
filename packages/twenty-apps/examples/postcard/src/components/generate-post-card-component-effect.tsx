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

const SYSTEM_PROMPT =
  'You are a postcard writing assistant. Write a short, warm postcard message ' +
  'under 150 words. Use a personal tone. Output ONLY the postcard message ' +
  'text, nothing else — no greeting label, no sign-off label, just the message.';

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
        const client = new CoreApiClient();

        const userPrompt = 'Write a postcard message for a friend.';

        const apiBaseUrl = process.env.TWENTY_API_URL;
        const token =
          process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

        if (!apiBaseUrl || !token) {
          throw new Error('API configuration missing');
        }

        const response = await fetch(`${apiBaseUrl}/rest/ai/generate-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            systemPrompt: SYSTEM_PROMPT,
            userPrompt,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();

          if (errorBody.includes('No AI models are available')) {
            throw new Error(
              'No AI models configured. Go to Settings > Admin Panel > AI to add a provider API key.',
            );
          }

          throw new Error(`AI request failed with status ${response.status}`);
        }

        const data = (await response.json()) as { text?: string };
        const generatedContent = data.text ?? '';

        await updateProgress(0.7);

        await client.mutation({
          updatePostCard: {
            __args: {
              id: recordId,
              data: { content: generatedContent },
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

export default defineFrontComponent({
  universalIdentifier: 'bd7649c0-7540-4267-ac4b-f062fbd635a3',
  name: 'Generate Post Card',
  description: 'Generates postcard content using AI',
  isHeadless: true,
  component: GeneratePostCardEffect,
  command: {
    universalIdentifier: '0f795c1c-8e25-44da-8962-80bef9602ee2',
    label: 'Generate post card content',
    shortLabel: 'Generate content',
    icon: 'IconSparkles',
    isPinned: true,
    availabilityType: 'RECORD_SELECTION',
    availabilityObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  },
});
