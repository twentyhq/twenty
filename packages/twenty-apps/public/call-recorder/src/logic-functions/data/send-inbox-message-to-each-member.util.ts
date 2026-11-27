import { sendInboxMessage } from 'twenty-sdk/logic-function';

import { type InboxMessage } from 'src/logic-functions/types/inbox-message.type';
import { isNotFoundError } from 'src/logic-functions/utils/is-not-found-error.util';

type SendInboxMessageToEachMemberResult = {
  skippedWorkspaceMemberIds: string[];
  failedSends: { workspaceMemberId: string; error: unknown }[];
};

export const sendInboxMessageToEachMember = async ({
  workspaceMemberIds,
  buildMessage,
}: {
  workspaceMemberIds: string[];
  buildMessage: (workspaceMemberId: string) => InboxMessage;
}): Promise<SendInboxMessageToEachMemberResult> => {
  const skippedWorkspaceMemberIds: string[] = [];
  const failedSends: SendInboxMessageToEachMemberResult['failedSends'] = [];

  for (const workspaceMemberId of workspaceMemberIds) {
    try {
      await sendInboxMessage({
        ...buildMessage(workspaceMemberId),
        workspaceMemberIds: [workspaceMemberId],
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        skippedWorkspaceMemberIds.push(workspaceMemberId);
        continue;
      }

      failedSends.push({ workspaceMemberId, error });
    }
  }

  return { skippedWorkspaceMemberIds, failedSends };
};
