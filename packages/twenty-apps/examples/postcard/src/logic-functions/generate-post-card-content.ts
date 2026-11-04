import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { ai, Response } from 'twenty-sdk/logic-function';

const SYSTEM_PROMPT =
  'You are a postcard writing assistant. Write a short, warm postcard message ' +
  'under 150 words. Use a personal tone. Output ONLY the postcard message ' +
  'text, nothing else — no greeting label, no sign-off label, just the message.';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const respond = ({
  body,
  status = 200,
}: {
  body: { success: boolean; error?: string };
  status?: number;
}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const handler = async (event: RoutePayload): Promise<Response> => {
  // API keys reach the route without a user, and would otherwise act with this app's own role
  if (!event.userWorkspaceId) {
    return respond({
      body: {
        success: false,
        error: 'Only a workspace member can generate a post card',
      },
      status: 403,
    });
  }

  const recordId = (event.body as { recordId?: unknown } | null)?.recordId;

  if (typeof recordId !== 'string' || !UUID_PATTERN.test(recordId)) {
    return respond({
      body: { success: false, error: 'recordId must be a UUID' },
      status: 400,
    });
  }

  const result = await ai.generate({
    instructions: SYSTEM_PROMPT,
    input: 'Write a postcard message for a friend.',
  });

  if (!result.success || !result.text) {
    return respond({
      body: {
        success: false,
        error: result.error ?? 'The model returned no text',
      },
      status: 502,
    });
  }

  await new CoreApiClient().mutation({
    updatePostCard: {
      __args: { id: recordId, data: { content: result.text } },
      id: true,
    },
  });

  return respond({ body: { success: true } });
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
