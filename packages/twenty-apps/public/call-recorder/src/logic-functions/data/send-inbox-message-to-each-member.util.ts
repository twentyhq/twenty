import { sendInboxMessage } from 'twenty-sdk/logic-function';

import { type InboxMessage } from 'src/logic-functions/types/inbox-message.type';
import { isNotFoundError } from 'src/logic-functions/utils/is-not-found-error.util';

type SendInboxMessageToEachMemberResult = {
  skippedWorkspaceMemberIds: string[];
  failedSends: { workspaceMemberId: string; error: unknown }[];
};

// A member's messages go in order and stop at the first failure, so a retry never posts them out of order.
export const sendInboxMessageToEachMember = async ({
  workspaceMemberIds,
  buildMessages,
}: {
  workspaceMemberIds: string[];
  buildMessages: (workspaceMemberId: string) => InboxMessage[];
}): Promise<SendInboxMessageToEachMemberResult> => {
  const skippedWorkspaceMemberIds: string[] = [];
  const failedSends: SendInboxMessageToEachMemberResult['failedSends'] = [];

  for (const workspaceMemberId of workspaceMemberIds) {
    for (const message of buildMessages(workspaceMemberId)) {
      try {
        await sendInboxMessage({
          ...message,
          workspaceMemberIds: [workspaceMemberId],
        });
      } catch (error) {
        if (isNotFoundError(error)) {
          skippedWorkspaceMemberIds.push(workspaceMemberId);
        } else {
          failedSends.push({ workspaceMemberId, error });
        }

        break;
      }
    }
  }

  return { skippedWorkspaceMemberIds, failedSends };
};
