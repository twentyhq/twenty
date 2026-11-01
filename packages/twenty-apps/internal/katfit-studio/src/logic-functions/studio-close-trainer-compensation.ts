import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  closeTrainerCompensation,
  type CloseCompensationInput,
} from 'src/logic-functions/handlers/trainer-compensation-handler';

const handler = async (
  payload: RoutePayload<CloseCompensationInput>,
  context: { userWorkspaceId: string | null },
): Promise<Response> => {
  const result = await closeTrainerCompensation(
    payload.body ?? ({} as CloseCompensationInput),
    context,
  );
  return new Response(result, { status: result.success ? 200 : result.status });
};

export default defineLogicFunction({
  universalIdentifier: 'ee516610-4333-4a99-859c-a9ceba11291e',
  name: 'studio-close-trainer-compensation',
  description:
    'Preview, close and correct trainer compensation with an auditable calculation snapshot',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/compensation/close',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
