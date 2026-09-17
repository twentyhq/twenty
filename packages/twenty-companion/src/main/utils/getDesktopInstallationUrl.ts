import { type OAuthDiscovery } from '../types/OAuthDiscovery';
import { validateServerUrl } from './validateServerUrl';
import { requestJson } from './requestJson';

export const getDesktopInstallationUrl = async (
  serverUrlInput: string,
): Promise<string> => {
  const serverUrl = validateServerUrl(serverUrlInput);
  const discovery = await requestJson<OAuthDiscovery>(
    `${serverUrl}/.well-known/oauth-authorization-server`,
  );
  if (discovery.issuer !== serverUrl)
    throw new Error('Twenty returned a different OAuth issuer.');
  const frontendUrl = validateServerUrl(
    new URL(discovery.authorization_endpoint).origin,
  );
  return `${frontendUrl}/settings/applications/available/8bdaaa9f-dc53-4247-a89b-aa386c9b3244`;
};
