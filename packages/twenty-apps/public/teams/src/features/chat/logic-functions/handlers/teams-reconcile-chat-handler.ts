import { isBoolean } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';
import { MetadataSchema } from 'twenty-client-sdk/metadata';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { type TeamsChatReconciliationResult } from 'src/features/chat/logic-functions/types/teams-chat-reconciliation.type';
import { currentUserHasPermissionFlag } from 'src/features/chat/logic-functions/utils/current-user-has-permission-flag';
import { reconcileTeamsChatTenantClaims } from 'src/features/chat/logic-functions/utils/reconcile-teams-chat-tenant-claims';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';
import { toErrorMessage } from 'src/utils/to-error-message';

export const teamsReconcileChatHandler = async (
  payload: Pick<RoutePayload<{ isEnabled?: unknown }>, 'body'>,
  context: Pick<LogicFunctionExecutionContext, 'workspaceId'>,
): Promise<TeamsChatReconciliationResult> => {
  const isEnabled = payload.body?.isEnabled;

  if (!isBoolean(isEnabled)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'isEnabled is required and must be a boolean.',
    };
  }

  if (
    !(await currentUserHasPermissionFlag(
      MetadataSchema.enumPermissionFlagType.APPLICATIONS,
    ))
  ) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members who can manage applications can change Teams chat for this workspace.',
    };
  }

  const isChatEnabled = isFeatureEnabled({
    isAvailable: RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED,
    settingValue: String(isEnabled),
  });

  try {
    return {
      success: true,
      connections: await reconcileTeamsChatTenantClaims({
        isChatEnabled,
        workspaceId: context.workspaceId,
      }),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Could not update Teams chat',
      error: toErrorMessage(error),
    };
  }
};
