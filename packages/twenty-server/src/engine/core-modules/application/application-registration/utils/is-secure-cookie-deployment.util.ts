import { isHttpsUrl } from 'src/engine/core-modules/application/application-registration/utils/is-https-url.util';

export const isSecureCookieDeployment = ({
  serverUrl,
  sameSite,
}: {
  serverUrl: string | undefined;
  sameSite: 'lax' | 'strict' | 'none';
}): boolean => isHttpsUrl(serverUrl) || sameSite === 'none';
