import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type ImageLoadingTransport } from '@/types/image/ImageLoadingTransport';
import { type MediaSessionHostFunctions } from '@/types/MediaSession';

export type FrontComponentHostThreadExports =
  FrontComponentHostCommunicationApi &
    MediaSessionHostFunctions &
    ImageLoadingTransport & {
      hostFetch: HostFetchFunction;
      observeElementGeometry: (remoteElementIds: string[]) => Promise<void>;
      unobserveElementGeometry: (remoteElementIds: string[]) => Promise<void>;
    };
