import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';

export type FrontComponentLocalStoragePersistQueue = {
  schedule: <TResult>(
    runPersist: (
      hostCommunicationApi: FrontComponentHostCommunicationApiStore,
    ) => Promise<TResult> | undefined,
  ) => Promise<TResult>;
  flush: () => void;
};
