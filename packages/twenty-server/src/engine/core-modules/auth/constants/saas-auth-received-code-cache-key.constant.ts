export const SAAS_AUTH_RECEIVED_CODE_CACHE_PREFIX = 'saas-auth:received-code';

export const getSaasAuthReceivedCodeCacheKey = (code: string) =>
  `${SAAS_AUTH_RECEIVED_CODE_CACHE_PREFIX}:${code}`;
