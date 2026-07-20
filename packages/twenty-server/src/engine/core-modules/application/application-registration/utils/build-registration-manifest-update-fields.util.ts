import { type ApplicationManifest } from 'twenty-shared/application';

import { type ApplicationRegistrationGalleryImage } from 'src/engine/core-modules/application/application-registration/types/application-registration-gallery-image.type';
import { fromManifestApplicationToDisplayFields } from 'src/engine/core-modules/application/application-registration/utils/from-manifest-application-to-display-fields.util';

// Gallery fileIds are kept for unchanged paths so a metadata refresh cannot
// drop already stored assets.
export const buildRegistrationManifestUpdateFields = ({
  manifestApplication,
  existingGalleryImages,
}: {
  manifestApplication: ApplicationManifest | undefined;
  existingGalleryImages: ApplicationRegistrationGalleryImage[] | null;
}) => {
  const displayFields =
    fromManifestApplicationToDisplayFields(manifestApplication);

  const existingFileIdByPath = new Map(
    (existingGalleryImages ?? []).map(({ path, fileId }) => [path, fileId]),
  );

  return {
    ...displayFields,
    galleryImages: displayFields.galleryImages.map((galleryImage) => ({
      ...galleryImage,
      fileId: existingFileIdByPath.get(galleryImage.path) ?? null,
    })),
  };
};
