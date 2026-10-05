import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum WorkspaceExceptionCode {
  IFRAME_ORIGIN_LIMIT_EXCEEDED = 'IFRAME_ORIGIN_LIMIT_EXCEEDED',
  SUBDOMAIN_NOT_FOUND = 'SUBDOMAIN_NOT_FOUND',
  SUBDOMAIN_ALREADY_TAKEN = 'SUBDOMAIN_ALREADY_TAKEN',
  SUBDOMAIN_NOT_VALID = 'SUBDOMAIN_NOT_VALID',
  DOMAIN_ALREADY_TAKEN = 'DOMAIN_ALREADY_TAKEN',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  WORKSPACE_CUSTOM_DOMAIN_DISABLED = 'WORKSPACE_CUSTOM_DOMAIN_DISABLED',
  ENVIRONMENT_VAR_NOT_ENABLED = 'ENVIRONMENT_VAR_NOT_ENABLED',
  CUSTOM_DOMAIN_NOT_FOUND = 'CUSTOM_DOMAIN_NOT_FOUND',
  APPLICATION_UNINSTALL_IN_PROGRESS = 'APPLICATION_UNINSTALL_IN_PROGRESS',
  AI_MODEL_PIN_NOT_VALID = 'AI_MODEL_PIN_NOT_VALID',
}

const getWorkspaceExceptionUserFriendlyMessage = (
  code: WorkspaceExceptionCode,
) => {
  switch (code) {
    case WorkspaceExceptionCode.IFRAME_ORIGIN_LIMIT_EXCEEDED:
      return msg`You can allow up to ${MAX_ALLOWED_IFRAME_ORIGINS} origins.`;
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
    case WorkspaceExceptionCode.APPLICATION_UNINSTALL_IN_PROGRESS:
      return msg`Application cleanup is still in progress. Please try again.`;
    case WorkspaceExceptionCode.AI_MODEL_PIN_NOT_VALID:
      return msg`This model cannot be used for this tier.`;
    default:
      assertUnreachable(code);
  }
};
const WORKSPACE_EXCEPTION_CATEGORY_BY_CODE = {
  [WorkspaceExceptionCode.IFRAME_ORIGIN_LIMIT_EXCEEDED]: 'BAD_USER_INPUT',
  [WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND]: 'NOT_FOUND',
  [WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN]: 'CONFLICT',
  [WorkspaceExceptionCode.SUBDOMAIN_NOT_VALID]: 'CONFLICT',
  [WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN]: 'CONFLICT',
  [WorkspaceExceptionCode.WORKSPACE_NOT_FOUND]: 'NOT_FOUND',
  [WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED]: 'FORBIDDEN',
  [WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED]: 'FORBIDDEN',
  [WorkspaceExceptionCode.CUSTOM_DOMAIN_NOT_FOUND]: 'NOT_FOUND',
  [WorkspaceExceptionCode.APPLICATION_UNINSTALL_IN_PROGRESS]: 'CONFLICT',
  [WorkspaceExceptionCode.AI_MODEL_PIN_NOT_VALID]: 'BAD_USER_INPUT',
} as const satisfies Record<WorkspaceExceptionCode, ExceptionCategory>;

export class WorkspaceException extends CustomException<WorkspaceExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWorkspaceExceptionUserFriendlyMessage(code),
      category: WORKSPACE_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

export const WorkspaceNotFoundDefaultError = new WorkspaceException(
  'Workspace not found',
  WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
);
