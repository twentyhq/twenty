import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

export interface DatabaseConfigDriverInterface {
  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] | undefined;

  update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void>;

  refreshAllCache(): Promise<void>;

  getCacheInfo(): {
    foundConfigValues: number;
    knownMissingKeys: number;
    cacheKeys: string[];
  };
}
