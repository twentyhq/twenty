import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackAssistantRequestCreatedBy } from 'src/logic-functions/data/find-slack-assistant-request-created-by';

const APPLICATION_ACTOR_SOURCE = 'APPLICATION';

// Any created slackAssistantRequest wakes the worker, including one written by
// hand in the UI, whose slackUserId is whatever the author typed. Honouring
// run-as on such a record would let anyone who can create one borrow a
// colleague's identity, so run-as is limited to records the app itself wrote
// while handling a verified Slack event. A hand-made request still gets an
// answer, just with the agent role.
export const wasSlackAssistantRequestCreatedByTheApp = async (
  client: CoreApiClient,
  requestId: string,
): Promise<boolean> => {
  const createdBy = await findSlackAssistantRequestCreatedBy(
    client,
    requestId,
  ).catch(() => undefined);

  if (!isDefined(createdBy)) {
    return false;
  }

  return (
    createdBy.source === APPLICATION_ACTOR_SOURCE &&
    !isDefined(createdBy.workspaceMemberId)
  );
};
