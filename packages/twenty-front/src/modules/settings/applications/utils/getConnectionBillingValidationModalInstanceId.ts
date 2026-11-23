export const getConnectionBillingValidationModalInstanceId = ({
  applicationId,
  connectionProviderName,
}: {
  applicationId: string;
  connectionProviderName: string;
}) =>
  `application-connection-billing-validation-${applicationId}-${connectionProviderName}`;
