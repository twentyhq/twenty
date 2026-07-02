import { isDefined } from 'twenty-shared/utils';

const FRONT_COMPONENT_ORIGIN_STORAGE_PREFIX = 'front-component:';

type BroadcastChannelConstructor = new (name: string) => object;

type IndexedDbDatabaseInfo = { name?: string; version?: number };

type IndexedDbFactoryLike = {
  open: (name: string, version?: number) => unknown;
  deleteDatabase: (name: string) => unknown;
  databases?: () => Promise<IndexedDbDatabaseInfo[]>;
  cmp?: (first: unknown, second: unknown) => number;
};

type OriginStorageScope = {
  BroadcastChannel?: BroadcastChannelConstructor;
  indexedDB?: IndexedDbFactoryLike;
};

const defineGlobal = (scope: object, key: string, value: unknown): void => {
  try {
    Object.defineProperty(scope, key, {
      value,
      configurable: true,
      writable: true,
    });
  } catch {}
};

const namespaceBroadcastChannel = (scope: OriginStorageScope): void => {
  const OriginalBroadcastChannel = scope.BroadcastChannel;

  if (!isDefined(OriginalBroadcastChannel)) {
    return;
  }

  class NamespacedBroadcastChannel extends OriginalBroadcastChannel {
    constructor(name: string) {
      super(`${FRONT_COMPONENT_ORIGIN_STORAGE_PREFIX}${name}`);
    }
  }

  defineGlobal(scope, 'BroadcastChannel', NamespacedBroadcastChannel);
};

const namespaceIndexedDb = (scope: OriginStorageScope): void => {
  const originalIndexedDb = scope.indexedDB;

  if (!isDefined(originalIndexedDb)) {
    return;
  }

  const namespacedIndexedDb: IndexedDbFactoryLike = {
    open: (name, version) =>
      originalIndexedDb.open(
        `${FRONT_COMPONENT_ORIGIN_STORAGE_PREFIX}${name}`,
        version,
      ),
    deleteDatabase: (name) =>
      originalIndexedDb.deleteDatabase(
        `${FRONT_COMPONENT_ORIGIN_STORAGE_PREFIX}${name}`,
      ),
    databases: isDefined(originalIndexedDb.databases)
      ? async () => {
          const databases = await originalIndexedDb.databases!();

          return databases
            .filter((database) =>
              database.name?.startsWith(FRONT_COMPONENT_ORIGIN_STORAGE_PREFIX),
            )
            .map((database) => ({
              ...database,
              name: database.name?.slice(
                FRONT_COMPONENT_ORIGIN_STORAGE_PREFIX.length,
              ),
            }));
        }
      : undefined,
    cmp: isDefined(originalIndexedDb.cmp)
      ? (first, second) => originalIndexedDb.cmp!(first, second)
      : undefined,
  };

  defineGlobal(scope, 'indexedDB', namespacedIndexedDb);
};

export const installOriginStorageIsolation = (
  globalScope: OriginStorageScope = globalThis as unknown as OriginStorageScope,
): void => {
  namespaceBroadcastChannel(globalScope);
  namespaceIndexedDb(globalScope);
};
