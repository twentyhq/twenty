export enum EmailingDomainDriver {
  AWS_SES = 'AWS_SES',
}

export enum EmailingDomainStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  TEMPORARY_FAILURE = 'TEMPORARY_FAILURE',
}
