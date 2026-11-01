import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { publishTrainerPayRate } from 'src/logic-functions/handlers/trainer-compensation-handler';

const handler = async (
  payload: RoutePayload<{ payRateId: string }>,
  context: { userWorkspaceId: string | null },
): Promise<Response> => {
  const result = await publishTrainerPayRate(
    payload.body?.payRateId ?? '',
    context,
  );
  return new Response(result, { status: result.success ? 200 : result.status });
};
export default defineLogicFunction({
  universalIdentifier: 'c6383e3b-dead-4b44-9504-9870589324b9',
  name: 'studio-publish-trainer-pay-rate',
  description:
    'Publish all four configurable compensation steps as a versioned snapshot',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/compensation/publish-rate',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
