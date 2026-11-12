import { isNonEmptyString } from '@sniptt/guards';

const isHttpsUrl = (url: string | undefined): boolean => {
  if (!isNonEmptyString(url)) {
    return false;
  }

  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

// SameSite=None is rejected by browsers without Secure, so it forces it.
export const isSecureCookieDeployment = ({
  serverUrl,
  sameSite,
}: {
  serverUrl: string | undefined;
  sameSite: 'lax' | 'strict' | 'none';
}): boolean => isHttpsUrl(serverUrl) || sameSite === 'none';
