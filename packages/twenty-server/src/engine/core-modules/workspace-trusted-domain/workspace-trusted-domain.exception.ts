import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceTrustedDomainException extends CustomException {
  constructor(message: string, code: WorkspaceTrustedDomainExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceTrustedDomainExceptionCode {
  WORKSPACE_TRUSTED_DOMAIN_NOT_FOUND = 'WORKSPACE_TRUSTED_DOMAIN_NOT_FOUND',
  WORKSPACE_TRUSTED_DOMAIN_ALREADY_VERIFIED = 'WORKSPACE_TRUSTED_DOMAIN_ALREADY_VERIFIED',
  WORKSPACE_TRUSTED_DOMAIN_DOES_NOT_MATCH_VALIDATOR_EMAIL = 'WORKSPACE_TRUSTED_DOMAIN_DOES_NOT_MATCH_VALIDATOR_EMAIL',
  WORKSPACE_TRUSTED_DOMAIN_VALIDATION_TOKEN_INVALID = 'WORKSPACE_TRUSTED_DOMAIN_VALIDATION_TOKEN_INVALID',
}
