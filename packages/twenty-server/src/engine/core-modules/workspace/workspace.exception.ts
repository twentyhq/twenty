import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceException extends CustomException {
  constructor(message: string, code: WorkspaceExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceExceptionCode {
  SUBDOMAIN_NOT_FOUND = 'SUBDOMAIN_NOT_FOUND',
  SUBDOMAIN_ALREADY_TAKEN = 'SUBDOMAIN_ALREADY_TAKEN',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
}
