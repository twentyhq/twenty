import { getUnipileApiKeyOrThrow } from 'src/unipile/utils/get-unipile-api-key-or-throw.util';

export const getUnipileRequestOptions = () => ({
  auth: getUnipileApiKeyOrThrow(),
  throwOnError: true as const,
});
