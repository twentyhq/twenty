import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationAssetManifest } from 'src/engine/core-modules/application/application-registration/types/application-registration-asset-manifest.type';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { isStorableAssetPath } from 'src/engine/core-modules/application/application-registration/utils/is-storable-asset-path.util';
import { toGalleryImagePaths } from 'src/engine/core-modules/application/application-registration/utils/to-gallery-image-paths.util';

// True when every storable asset declared by the manifest already has a file
// stored for the registration, so a sync can skip re-downloading them.
export const areRegistrationAssetsStored = (
  registration: Pick<
    ApplicationRegistrationEntity,
    'logoFileId' | 'galleryImages'
  >,
  manifestApplication: ApplicationRegistrationAssetManifest | undefined,
): boolean => {
  const logoPath = manifestApplication?.logo ?? manifestApplication?.logoUrl;

  if (
    isDefined(logoPath) &&
    isStorableAssetPath(logoPath) &&
    !isDefined(registration.logoFileId)
  ) {
    return false;
  }

  const storedFileIdByPath = new Map(
    (registration.galleryImages ?? []).map(({ path, fileId }) => [
      path,
      fileId,
    ]),
  );

  return toGalleryImagePaths(manifestApplication)
    .filter(isStorableAssetPath)
    .every((path) => isDefined(storedFileIdByPath.get(path)));
};
