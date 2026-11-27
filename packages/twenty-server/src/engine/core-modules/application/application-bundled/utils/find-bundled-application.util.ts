import { BUNDLED_APPLICATIONS } from 'src/engine/core-modules/application/application-bundled/constants/bundled-applications.constant';
import { type BundledApplication } from 'src/engine/core-modules/application/application-bundled/types/bundled-application.type';

export const findBundledApplication = (
  universalIdentifier: string,
): BundledApplication | undefined =>
  BUNDLED_APPLICATIONS.find(
    ({ manifest }) =>
      manifest.application.universalIdentifier ===
      universalIdentifier.toLowerCase(),
  );
