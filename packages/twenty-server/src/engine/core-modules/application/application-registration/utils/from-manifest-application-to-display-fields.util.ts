import { Logger } from '@nestjs/common';

import {
  APPLICATION_CATEGORIES,
  type ApplicationManifest,
  isKnownApplicationCategory,
} from 'twenty-shared/application';

const logger = new Logger('ApplicationCategory');

const warnOnUnknownApplicationCategory = (
  category: string | null | undefined,
): void => {
  if (
    category !== null &&
    category !== undefined &&
    category !== '' &&
    !isKnownApplicationCategory(category)
  ) {
    logger.warn(
      `Application category "${category}" is not a known ApplicationCategory (${APPLICATION_CATEGORIES.join(
        ', ',
      )}). Arbitrary category strings are kept for backward compatibility and may be removed.`,
    );
  }
};

export const fromManifestApplicationToDisplayFields = (
  application: ApplicationManifest | undefined,
) => {
  warnOnUnknownApplicationCategory(application?.category);

  return {
    logo: application?.logoUrl ?? null,
    description: application?.description ?? null,
    author: application?.author ?? null,
    category: application?.category ?? null,
    websiteUrl: application?.websiteUrl ?? null,
    aboutDescription: application?.aboutDescription ?? null,
    termsUrl: application?.termsUrl ?? null,
    emailSupport: application?.emailSupport ?? null,
    issueReportUrl: application?.issueReportUrl ?? null,
    screenshots: application?.screenshots ?? [],
  };
};
