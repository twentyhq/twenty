const TOKEN_EXPIRED_PATTERN = /token has expired|unauthori[sz]ed|unauthenticated|invalid api key/i;

export const isTokenExpiredMessage = (
  message: string | undefined | null,
): boolean => {
  if (typeof message !== 'string' || message.length === 0) {
    return false;
  }

  return TOKEN_EXPIRED_PATTERN.test(message);
};