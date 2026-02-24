import { ObjectMetadataProviderInitialEffect } from '@/metadata-store/effect-components/ObjectMetadataProviderInitialEffect';
import { UserMetadataProviderInitialEffect } from '@/metadata-store/effect-components/UserMetadataProviderInitialEffect';
import { ViewMetadataProviderInitialEffect } from '@/metadata-store/effect-components/ViewMetadataProviderInitialEffect';

export const MetadataProviderInitialEffects = () => (
  <>
    <UserMetadataProviderInitialEffect />
    <ObjectMetadataProviderInitialEffect />
    <ViewMetadataProviderInitialEffect />
  </>
);
