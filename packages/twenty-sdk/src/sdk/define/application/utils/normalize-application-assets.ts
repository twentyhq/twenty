import { isAbsoluteUrl } from 'twenty-shared/utils';

import { type ApplicationConfig } from '@/sdk/define/application/application-config';

export const normalizeApplicationAssets = (
  application: ApplicationConfig,
): {
  logo?: string;
  galleryImages: string[];
  warnings: string[];
} => {
  const warnings: string[] = [];

  let logo = application.logo;

  if (logo && isAbsoluteUrl(logo)) {
    warnings.push(
      `Application logo "${logo}" is an external URL. External asset URLs are no longer supported and are ignored. Bundle the image in your public/ folder instead.`,
    );
    logo = undefined;
  }

  if (!logo && application.logoUrl) {
    if (isAbsoluteUrl(application.logoUrl)) {
      warnings.push(
        `Application logoUrl "${application.logoUrl}" is an external URL. External asset URLs are no longer supported and are ignored. Bundle the image in your public/ folder and reference it via logo.`,
      );
    } else {
      warnings.push(
        '`logoUrl` is deprecated. Use `logo` to reference an image bundled in your public/ folder.',
      );
      logo = application.logoUrl;
    }
  }

  const usesDeprecatedScreenshots =
    !application.galleryImages && (application.screenshots?.length ?? 0) > 0;

  if (usesDeprecatedScreenshots) {
    warnings.push(
      '`screenshots` is deprecated. Use `galleryImages` referencing images bundled in your public/ folder.',
    );
  }

  const rawGalleryImages =
    application.galleryImages ?? application.screenshots ?? [];

  const galleryImages = rawGalleryImages.filter((galleryImage) => {
    if (isAbsoluteUrl(galleryImage)) {
      warnings.push(
        `Gallery image "${galleryImage}" is an external URL. External asset URLs are no longer supported and are ignored.`,
      );

      return false;
    }

    return true;
  });

  return { logo, galleryImages, warnings };
};
