import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const assertCanRunAsWorkspaceMember = ({
  runAsWorkspaceMemberId,
  callerApplication,
  requestUserWorkspaceId,
  requestWorkspaceMemberId,
}: {
  runAsWorkspaceMemberId: string;
  callerApplication?: FlatApplication;
  requestUserWorkspaceId: string | null;
  requestWorkspaceMemberId: string | null;
}): FlatApplication => {
  if (!isDefined(callerApplication)) {
    throw new AiException(
      'Running an agent as a workspace member requires an application access token',
      AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
    );
  }

  if (
    isDefined(requestUserWorkspaceId) &&
    requestWorkspaceMemberId !== runAsWorkspaceMemberId
  ) {
    throw new AiException(
      'An application token issued for a user can only run an agent as that user',
      AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
    );
  }

  // The application role caps the member's, so without one the application could act with any member's access
  if (!isDefined(callerApplication.defaultRoleId)) {
    throw new AiException(
      'Running an agent as a workspace member requires an application with a role',
      AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
    );
  }

  return callerApplication;
};
