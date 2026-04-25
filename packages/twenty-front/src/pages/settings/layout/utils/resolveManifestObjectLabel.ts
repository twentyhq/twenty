import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

// Resolves an object's display label from its universalIdentifier, looking
// first in the app's own manifest objects then falling back to the standard
// objects table. Returns undefined if neither source has the identifier.
//
// Note: this can't resolve the workspace-side label of a standard object
// (we don't have objectMetadataItems here), only what the manifest knows.
// It's enough to render readable secondary text on layout detail pages.
export const resolveManifestObjectLabel = (
  uid: string | undefined | null,
  manifest: Manifest | undefined,
): string | undefined => {
  if (!isDefined(uid)) return undefined;

  const manifestObject = manifest?.objects.find(
    (obj) => obj.universalIdentifier === uid,
  );
  if (isDefined(manifestObject)) {
    return manifestObject.labelSingular;
  }

  return findObjectNameByUniversalIdentifier(uid);
};
