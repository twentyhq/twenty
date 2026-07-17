import { type ApplicationManifest } from 'twenty-shared/application';

import { type ApplicationRegistrationGalleryImage } from 'src/engine/core-modules/application/application-registration/types/application-registration-gallery-image.type';
import { toGalleryImagePaths } from 'src/engine/core-modules/application/application-registration/utils/to-gallery-image-paths.util';

export const fromManifestApplicationToDisplayFields = (
  application: ApplicationManifest | undefined,
) => ({
  logo: application?.logo ?? application?.logoUrl ?? null,
  description: application?.description ?? null,
  author: application?.author ?? null,
  category: application?.category ?? null,
  websiteUrl: application?.websiteUrl ?? null,
  aboutDescription: application?.aboutDescription ?? null,
  termsUrl: application?.termsUrl ?? null,
  emailSupport: application?.emailSupport ?? null,
  issueReportUrl: application?.issueReportUrl ?? null,
  galleryImages: toGalleryImagePaths(application).map(
    (path): ApplicationRegistrationGalleryImage => ({ path, fileId: null }),
  ),
});
