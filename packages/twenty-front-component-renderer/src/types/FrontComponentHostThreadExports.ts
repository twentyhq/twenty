import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type HostFetchFunction } from '@/types/HostFetchFunction';

export type FrontComponentHostThreadExports =
  FrontComponentHostCommunicationApi & {
    hostFetch: HostFetchFunction;
    observeElementGeometry: (remoteElementIds: string[]) => Promise<void>;
    unobserveElementGeometry: (remoteElementIds: string[]) => Promise<void>;
  };
