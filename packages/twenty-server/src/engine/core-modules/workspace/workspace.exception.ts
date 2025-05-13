import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceException extends CustomException {
  declare code: WorkspaceExceptionCode;
  constructor(message: string, code: WorkspaceExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceExceptionCode {
  SUBDOMAIN_NOT_FOUND = 'SUBDOMAIN_NOT_FOUND',
  SUBDOMAIN_ALREADY_TAKEN = 'SUBDOMAIN_ALREADY_TAKEN',
  DOMAIN_ALREADY_TAKEN = 'DOMAIN_ALREADY_TAKEN',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  WORKSPACE_CUSTOM_DOMAIN_DISABLED = 'WORKSPACE_CUSTOM_DOMAIN_DISABLED',
  ENVIRONMENT_VAR_NOT_ENABLED = 'ENVIRONMENT_VAR_NOT_ENABLED',
}
