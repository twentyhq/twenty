import { type AppPath, type NavigateOptions } from 'twenty-shared/types';

export type FrontComponentExecutionContext = {
  userId: string | null;
  navigate: (
    to: AppPath,
    params?: Record<string, string | null>,
    queryParams?: Record<string, unknown>,
    options?: NavigateOptions,
  ) => Promise<void>;
};
