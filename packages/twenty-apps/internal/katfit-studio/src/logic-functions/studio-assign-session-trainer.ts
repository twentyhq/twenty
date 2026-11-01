import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  assignSessionTrainer,
  type AssignSessionTrainerInput,
} from 'src/logic-functions/handlers/assign-session-trainer-handler';
const handler = async (
  payload: RoutePayload<AssignSessionTrainerInput>,
  context: { userWorkspaceId: string | null },
): Promise<Response> => {
  const result = await assignSessionTrainer(
    payload.body ?? ({} as AssignSessionTrainerInput),
    context,
  );
  return new Response(result, { status: result.success ? 200 : result.status });
};
export default defineLogicFunction({
  universalIdentifier: '7a02de04-19fe-46b8-82ae-787c26af08b9',
  name: 'studio-assign-session-trainer',
  description:
    'Assign one catalog trainer to an open class and retain the assignment audit',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/sessions/assign-trainer',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
