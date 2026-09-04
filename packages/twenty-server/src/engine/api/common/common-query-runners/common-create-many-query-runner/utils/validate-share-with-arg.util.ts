import { msg } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { resolveShareWithPrincipal } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/resolve-share-with-principal.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type ShareWithInput } from 'src/engine/api/common/types/share-with-input.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const validateShareWithArg = ({
  authContext,
  shareWith,
}: {
  authContext: WorkspaceAuthContext;
  shareWith?: ShareWithInput[];
}): void => {
  if (!isUserAuthContext(authContext) && !isNonEmptyArray(shareWith)) {
    throw new CommonQueryRunnerException(
      'Creating a record of a private object requires the shareWith argument',
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: msg`Creating a record of a private object requires the shareWith argument`,
      },
    );
  }

  shareWith?.forEach(resolveShareWithPrincipal);
};
