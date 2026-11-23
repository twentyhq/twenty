import { type PackageJson } from 'type-fest';

import { type BundledApplication } from 'src/engine/core-modules/application/application-bundled/types/bundled-application.type';

// Install verifies the stored package.json against the manifest checksum, so both derive from this
export const buildBundledApplicationPackageJson = ({
  universalIdentifier,
  version,
}: {
  universalIdentifier: string;
  version: BundledApplication['version'];
}): PackageJson => ({
  name: `twenty-bundled-${universalIdentifier}`,
  version,
});
