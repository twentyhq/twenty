import { TEAMS_CONNECTOR_SERVICE_URL_HOST_SUFFIXES } from 'src/features/chat/logic-functions/constants/teams-connector-service-url-host-suffixes';
import { TEAMS_CONNECTOR_SERVICE_URL_HOSTS } from 'src/features/chat/logic-functions/constants/teams-connector-service-url-hosts';

export const isTeamsConnectorServiceUrl = (serviceUrl: string): boolean => {
  try {
    const { protocol, hostname } = new URL(serviceUrl);

    return (
      protocol === 'https:' &&
      (TEAMS_CONNECTOR_SERVICE_URL_HOSTS.includes(hostname) ||
        TEAMS_CONNECTOR_SERVICE_URL_HOST_SUFFIXES.some((hostSuffix) =>
          hostname.endsWith(hostSuffix),
        ))
    );
  } catch {
    return false;
  }
};
