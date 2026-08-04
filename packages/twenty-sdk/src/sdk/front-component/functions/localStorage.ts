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

const stringifyLocalStorageValue = (value: unknown): string | undefined => {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

const serializeLocalStorageValue = (value: unknown): string => {
  const serializedValue = stringifyLocalStorageValue(value);

  if (!isDefined(serializedValue)) {
    throw new Error('localStorage.set requires a JSON-serializable value');
  }

  return serializedValue;
};

const parseLocalStorageValue = <TValue>(serializedValue: string): TValue => {
  try {
    return JSON.parse(serializedValue) as TValue;
  } catch {
    return serializedValue as TValue;
  }
};

export const localStorage = {
  async get<TValue = unknown>(key: string): Promise<TValue | null> {
    const serializedValue = getLocalStorageBridge().getItem(key);

    if (!isDefined(serializedValue)) {
      return null;
    }

    return parseLocalStorageValue<TValue>(serializedValue);
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
