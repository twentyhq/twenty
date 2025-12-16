import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const workspaceExceptionUserFriendlyMessages: Record<
  WorkspaceExceptionCode,
  MessageDescriptor
> = {
  [WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND]: msg`Subdomain not found.`,
  [WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN]: msg`This subdomain is already taken.`,
  [WorkspaceExceptionCode.SUBDOMAIN_NOT_VALID]: msg`Invalid subdomain.`,
  [WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN]: msg`This domain is already taken.`,
  [WorkspaceExceptionCode.WORKSPACE_NOT_FOUND]: msg`Workspace not found.`,
  [WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED]: msg`Custom domains are disabled for this workspace.`,
  [WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED]: msg`This feature is not enabled.`,
  [WorkspaceExceptionCode.CUSTOM_DOMAIN_NOT_FOUND]: msg`Custom domain not found.`,
};

export class WorkspaceException extends CustomException<WorkspaceExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? workspaceExceptionUserFriendlyMessages[code],
    });
  }
}

export const WorkspaceNotFoundDefaultError = new WorkspaceException(
  'Workspace not found',
  WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
);
