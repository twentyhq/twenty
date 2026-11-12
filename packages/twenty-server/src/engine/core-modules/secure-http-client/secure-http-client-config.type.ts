import { type CreateAxiosDefaults } from 'axios';

export type SecureHttpClientConfig = CreateAxiosDefaults & {
  retries?: number;
  shouldResetTimeout?: boolean;
};
