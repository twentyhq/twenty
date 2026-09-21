import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';

export const getToolAuthContextOrThrow = (
  context: ToolExecutionContext,
): WorkspaceAuthContext => {
  if (!isDefined(context.authContext)) {
    throw new ConnectedAccountException(
      'An auth context is required to resolve the connected account',
      ConnectedAccountExceptionCode.INVALID_CONNECTED_ACCOUNT_INPUT,
    );
  }

  return context.authContext;
};
