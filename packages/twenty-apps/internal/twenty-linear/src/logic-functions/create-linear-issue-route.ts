import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';

import { CREATE_LINEAR_ISSUE_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createLinearIssueHandler } from 'src/logic-functions/handlers/create-linear-issue-handler';

const handler = async (event: RoutePayload) => {
  const body = event.body as Record<string, unknown> | null;

  return createLinearIssueHandler({
    teamId: body?.teamId as string | undefined,
    title: body?.title as string | undefined,
    description: body?.description as string | undefined,
    priority: body?.priority as number | undefined,
    stateId: body?.stateId as string | undefined,
    assigneeId: body?.assigneeId as string | undefined,
    projectId: body?.projectId as string | undefined,
    estimate: body?.estimate as number | undefined,
    labelIds: body?.labelIds as string[] | undefined,
    cycleId: body?.cycleId as string | undefined,
    dueDate: body?.dueDate as string | undefined,
  });
};

export default defineLogicFunction({
  universalIdentifier: CREATE_LINEAR_ISSUE_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'create-linear-issue-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/linear/issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
