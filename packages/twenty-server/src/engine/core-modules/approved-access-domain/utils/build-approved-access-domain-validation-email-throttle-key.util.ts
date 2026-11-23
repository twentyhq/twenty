export const buildApprovedAccessDomainValidationEmailThrottleKey = (
  workspaceIdOrRecipientEmail: string,
) =>
  `approved-access-domain-validation-email:throttler:${workspaceIdOrRecipientEmail}`;
