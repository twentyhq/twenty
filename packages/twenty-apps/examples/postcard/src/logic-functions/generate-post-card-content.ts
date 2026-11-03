import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { ai, Response } from 'twenty-sdk/logic-function';

const SYSTEM_PROMPT =
  'You are a postcard writing assistant. Write a short, warm postcard message ' +
  'under 150 words. Use a personal tone. Output ONLY the postcard message ' +
  'text, nothing else — no greeting label, no sign-off label, just the message.';

const respond = (body: { success: boolean; error?: string }, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const handler = async (event: RoutePayload): Promise<Response> => {
  const recordId = (event.body as { recordId?: string } | null)?.recordId;

  if (!recordId) {
    return respond({ success: false, error: 'recordId is required' }, 400);
  }

  const result = await ai.generate({
    instructions: SYSTEM_PROMPT,
    input: 'Write a postcard message for a friend.',
  });

  if (!result.success) {
    return respond({ success: false, error: result.error ?? undefined }, 502);
  }

  await new CoreApiClient().mutation({
    updatePostCard: {
      __args: { id: recordId, data: { content: result.text ?? '' } },
      id: true,
    },
  });

  return respond({ success: true });
};

export default defineLogicFunction({
  universalIdentifier: '9adae148-35aa-431a-8854-fae3b27c3870',
  name: 'generate-post-card-content',
  description: 'Writes the content of a post card with ai.generate.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/post-cards/generate',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
