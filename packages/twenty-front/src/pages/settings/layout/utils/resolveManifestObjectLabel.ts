import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { findObjectNameByUniversalIdentifier } from '~/pages/settings/applications/utils/findObjectNameByUniversalIdentifier';

// Resolve an object's display label by universalIdentifier. Tries this app's
// manifest first, then standard objects (matched by name, then optionally
// labeled via the workspace's objectMetadataItems).
export const resolveManifestObjectLabel = (
  uid: string | undefined | null,
  manifest: Manifest | undefined,
  objectMetadataItems?: EnrichedObjectMetadataItem[],
): string | undefined => {
  if (!isDefined(uid)) return undefined;

  const manifestObject = manifest?.objects.find(
    (obj) => obj.universalIdentifier === uid,
  );
  if (isDefined(manifestObject)) {
    return manifestObject.labelSingular;
  }

  const standardName = findObjectNameByUniversalIdentifier(uid);
  if (!isDefined(standardName)) return undefined;

  if (isDefined(objectMetadataItems)) {
    const item = objectMetadataItems.find(
      (object) => object.nameSingular === standardName,
    );
    if (isDefined(item)) return item.labelSingular;
  }

  return standardName;
};
