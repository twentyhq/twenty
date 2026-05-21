import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';

const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const resolveApplicationRegistrationLogoUrl = ({
  logo,
  sourceType,
  sourcePackage,
  latestAvailableVersion,
  cdnBaseUrl,
}: {
  logo: string | null | undefined;
  sourceType: ApplicationRegistrationSourceType;
  sourcePackage: string | null;
  latestAvailableVersion: string | null;
  cdnBaseUrl: string;
}): string | null => {
  if (!logo) {
    return null;
  }

  if (isAbsoluteUrl(logo)) {
    return logo;
  }

  if (
    sourceType === ApplicationRegistrationSourceType.NPM &&
    sourcePackage &&
    latestAvailableVersion
  ) {
    return buildRegistryCdnUrl({
      cdnBaseUrl,
      packageName: sourcePackage,
      version: latestAvailableVersion,
      filePath: logo,
    });
  }

  return null;
};
