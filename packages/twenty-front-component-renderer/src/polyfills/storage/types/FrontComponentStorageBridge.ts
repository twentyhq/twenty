import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';

export type FrontComponentStorageBridge = {
  getItem: (key: string) => string | null;
  getKeyAtIndex: (index: number) => string | null;
  getLength: () => number;
  setItem: (key: string, serializedValue: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  seed: (seededEntries: Record<string, string>) => void;
  connectHostCommunicationApi: (
    hostCommunicationApi: FrontComponentHostCommunicationApiStore,
  ) => void;
};
