import { type ManagedIframeElementProps } from '@/media-access/types/ManagedIframeElementProps';
import { type MediaAccessOwner } from '@/media-access/types/MediaAccessOwner';
import { type MediaCapability } from '@/media-access/types/MediaCapability';
import { type IframeMediaPermission } from 'twenty-shared/types';

export type ManagedIframeProps = ManagedIframeElementProps & {
  owner: MediaAccessOwner;
  requestedMediaCapabilities?: readonly MediaCapability[];
  iframeMediaPermissions: readonly IframeMediaPermission[];
};
