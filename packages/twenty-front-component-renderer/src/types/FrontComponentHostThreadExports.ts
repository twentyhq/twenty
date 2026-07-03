import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type HostFetchFunction } from '@/types/HostFetch';

export type FrontComponentHostThreadExports =
  FrontComponentHostCommunicationApi & {
    hostFetch: HostFetchFunction;
  };
