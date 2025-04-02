import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';

export interface ConfigVarDriver {
  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T];
  initialize(): Promise<void>;
  clearCache(key: keyof EnvironmentVariables): void;
  refreshConfig(key: keyof EnvironmentVariables): Promise<void>;
}
