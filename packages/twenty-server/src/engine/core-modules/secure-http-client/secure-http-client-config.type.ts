import { type CreateAxiosDefaults } from 'axios';

export type SecureHttpClientConfig = CreateAxiosDefaults & {
  retries?: number;
  shouldResetTimeout?: boolean;
  // For URLs chosen by unauthenticated callers: ignores the instance's internal-host exceptions
  shouldRestrictToPublicHosts?: boolean;
};
