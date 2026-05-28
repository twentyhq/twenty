export enum EmailingDomainDriver {
  AWS_SES = 'AWS_SES',
  // Local/dev driver that logs sends and returns a synthetic messageId.
  // Lets you exercise the full campaign flow (mutation → fan-out → job →
  // message status update) without AWS credentials.
  LOG = 'LOG',
}
