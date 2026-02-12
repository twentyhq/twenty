import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceExceptionCode {
  SUBDOMAIN_NOT_FOUND = 'SUBDOMAIN_NOT_FOUND',
  SUBDOMAIN_ALREADY_TAKEN = 'SUBDOMAIN_ALREADY_TAKEN',
  SUBDOMAIN_NOT_VALID = 'SUBDOMAIN_NOT_VALID',
  DOMAIN_ALREADY_TAKEN = 'DOMAIN_ALREADY_TAKEN',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  WORKSPACE_CUSTOM_DOMAIN_DISABLED = 'WORKSPACE_CUSTOM_DOMAIN_DISABLED',
  ENVIRONMENT_VAR_NOT_ENABLED = 'ENVIRONMENT_VAR_NOT_ENABLED',
  CUSTOM_DOMAIN_NOT_FOUND = 'CUSTOM_DOMAIN_NOT_FOUND',
}

const getWorkspaceExceptionUserFriendlyMessage = (
  code: WorkspaceExceptionCode,
) => {
  switch (code) {
    case WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND:
      return msg`Subdomain not found.`;
    case WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN:
      return msg`This subdomain is already taken.`;
    case WorkspaceExceptionCode.SUBDOMAIN_NOT_VALID:
      return msg`Invalid subdomain.`;
    case WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN:
      return msg`This domain is already taken.`;
    case WorkspaceExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED:
      return msg`Custom domains are disabled for this workspace.`;
    case WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED:
      return msg`This feature is not enabled.`;
    case WorkspaceExceptionCode.CUSTOM_DOMAIN_NOT_FOUND:
      return msg`Custom domain not found.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceException extends CustomException<WorkspaceExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWorkspaceExceptionUserFriendlyMessage(code),
    });
  }
}

export const WorkspaceNotFoundDefaultError = new WorkspaceException(
  'Workspace not found',
  WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
);
