import { TEAMS_CONNECTOR_SERVICE_URL_HOST_SUFFIXES } from 'src/logic-functions/constants/teams-connector-service-url-host-suffixes';

export const isTeamsConnectorServiceUrl = (serviceUrl: string): boolean => {
  try {
    const { protocol, hostname } = new URL(serviceUrl);

    return (
      protocol === 'https:' &&
      TEAMS_CONNECTOR_SERVICE_URL_HOST_SUFFIXES.some((hostSuffix) =>
        hostname.endsWith(hostSuffix),
      )
    );
  } catch {
    return false;
  }
};
