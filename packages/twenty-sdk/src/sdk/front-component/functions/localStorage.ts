import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_LOCAL_STORAGE_BRIDGE_KEY } from '../constants/front-component-local-storage-bridge-key';
import { type FrontComponentLocalStorageBridge } from '../types/FrontComponentLocalStorageBridge';

const getLocalStorageBridge = (): FrontComponentLocalStorageBridge => {
  const bridge = (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_LOCAL_STORAGE_BRIDGE_KEY
  ] as FrontComponentLocalStorageBridge | undefined;

  if (!isDefined(bridge)) {
    throw new Error('localStorage is not available in this context');
  }

  return bridge;
};

const serializeLocalStorageValue = (value: unknown): string => {
  const serializedValue = JSON.stringify(value);

  if (!isDefined(serializedValue)) {
    throw new Error('localStorage.set requires a JSON-serializable value');
  }

  return serializedValue;
};

export const localStorage = {
  async get<TValue = unknown>(key: string): Promise<TValue | null> {
    const serializedValue = getLocalStorageBridge().getItem(key);

    if (!isDefined(serializedValue)) {
      return null;
    }

    return JSON.parse(serializedValue) as TValue;
  },

  async set<TValue>(key: string, value: TValue): Promise<void> {
    await getLocalStorageBridge().setItemAndPersist(
      key,
      serializeLocalStorageValue(value),
    );
  },

  async delete(key: string): Promise<boolean> {
    return getLocalStorageBridge().removeItemAndPersist(key);
  },

  async keys(): Promise<string[]> {
    return getLocalStorageBridge().getKeys();
  },

  async clear(): Promise<void> {
    await getLocalStorageBridge().clearAndPersist();
  },
};
