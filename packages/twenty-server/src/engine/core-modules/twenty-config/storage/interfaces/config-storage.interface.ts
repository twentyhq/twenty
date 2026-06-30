import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

export interface ConfigStorageInterface {
  get<T extends keyof ConfigVariables>(
    key: T,
  ): Promise<ConfigVariables[T] | undefined>;

  set<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void>;

  delete<T extends keyof ConfigVariables>(key: T): Promise<void>;

  loadAll(): Promise<
    Map<keyof ConfigVariables, ConfigVariables[keyof ConfigVariables]>
  >;
}
