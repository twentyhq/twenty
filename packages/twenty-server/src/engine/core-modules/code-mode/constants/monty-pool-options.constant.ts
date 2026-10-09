import type { MontyOptions } from '@pydantic/monty';

export const MONTY_POOL_OPTIONS = {
  maxProcesses: 4,
  checkoutTimeout: 10,
  requestTimeout: 60,
} as const satisfies MontyOptions;
