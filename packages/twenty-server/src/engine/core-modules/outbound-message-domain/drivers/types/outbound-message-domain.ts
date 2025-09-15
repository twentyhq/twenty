export enum OutboundMessageDomainDriver {
  AWS_SES = 'AWS_SES',
}

export enum OutboundMessageDomainStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  TEMPORARY_FAILURE = 'TEMPORARY_FAILURE',
}
