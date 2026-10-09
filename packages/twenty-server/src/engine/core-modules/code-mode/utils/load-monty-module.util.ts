import type * as Monty from '@pydantic/monty';

export type MontyModule = typeof Monty;

// The native binding loads on import and throws where no build exists (musl), so it must not load at boot
export const loadMontyModule = (): Promise<MontyModule> =>
  import('@pydantic/monty');
