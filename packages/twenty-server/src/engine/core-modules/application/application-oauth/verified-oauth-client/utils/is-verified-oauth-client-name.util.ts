import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';

export const isVerifiedOAuthClientName = (name: string): boolean => {
  const normalizedName = name.trim().toLowerCase();

  return VERIFIED_OAUTH_CLIENTS.some(
    (verifiedClient) => verifiedClient.name.toLowerCase() === normalizedName,
  );
};
