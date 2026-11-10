import { isDefined } from 'twenty-shared/utils';

export const getApplicationApiKeyConnectionDialogId = ({
  applicationId,
  providerName,
  reconnectingConnectedAccountId,
}: {
  applicationId: string;
  providerName: string;
  reconnectingConnectedAccountId?: string;
}) =>
  isDefined(reconnectingConnectedAccountId)
    ? `application-api-key-connection-reconnect-${reconnectingConnectedAccountId}`
    : `application-api-key-connection-${applicationId}-${providerName}`;
