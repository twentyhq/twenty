import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type GeometryMeasureResult } from '@/types/GeometryMeasureResult';
import { type HostFetchFunction } from '@/types/HostFetchFunction';

export type FrontComponentHostThreadExports =
  FrontComponentHostCommunicationApi & {
    hostFetch: HostFetchFunction;
    observeElementGeometry: (remoteElementIds: string[]) => Promise<void>;
    unobserveElementGeometry: (remoteElementIds: string[]) => Promise<void>;
    measureElementGeometry: (
      remoteElementIds: string[],
    ) => Promise<GeometryMeasureResult>;
  };
