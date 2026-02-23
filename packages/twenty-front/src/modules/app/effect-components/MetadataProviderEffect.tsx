import { ObjectMetadataProviderEffect } from '@/app/effect-components/ObjectMetadataProviderEffect';
import { UserMetadataProviderEffect } from '@/app/effect-components/UserMetadataProviderEffect';
import { ViewMetadataProviderEffect } from '@/app/effect-components/ViewMetadataProviderEffect';

export const MetadataProviderEffects = () => (
  <>
    <UserMetadataProviderEffect />
    <ObjectMetadataProviderEffect />
    <ViewMetadataProviderEffect />
  </>
);
