import { type FrontComponentLocalStorageBridge } from 'twenty-sdk/front-component';

export type FrontComponentLocalStorageWorkerBridge =
  FrontComponentLocalStorageBridge & {
    setItem: (key: string, serializedValue: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
    getKeyAtIndex: (index: number) => string | null;
    getLength: () => number;
    seed: (entries: Record<string, string>) => void;
    flushPendingPersistOperations: () => void;
  };
