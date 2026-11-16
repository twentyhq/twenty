import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';

const normalizeClientName = (name: string): string =>
  name
    .normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const isVerifiedOAuthClientName = (name: string): boolean => {
  const normalizedName = normalizeClientName(name);

  return VERIFIED_OAUTH_CLIENTS.some(
    (verifiedClient) =>
      normalizeClientName(verifiedClient.name) === normalizedName,
  );
};
