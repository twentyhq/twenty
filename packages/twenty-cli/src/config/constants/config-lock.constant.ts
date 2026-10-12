import { REQUEST_TIMEOUT_MILLISECONDS } from '@/transport/constants/request-timeout-milliseconds.constant';

export const CONFIG_LOCK = {
  // OAuth refresh holds the lock across discovery and token exchange.
  TIMEOUT_MILLISECONDS: 2 * REQUEST_TIMEOUT_MILLISECONDS + 5_000,
  RETRY_MILLISECONDS: 50,
} as const;
