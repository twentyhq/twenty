import { type ApplicationRegistrationAssetManifest } from 'src/engine/core-modules/application/application-registration/types/application-registration-asset-manifest.type';

export const toGalleryImagePaths = (
  application: ApplicationRegistrationAssetManifest | undefined,
): string[] => {
  const galleryImages = application?.galleryImages;

  if (galleryImages && galleryImages.length > 0) {
    return galleryImages;
  }

  return application?.screenshots ?? [];
};
