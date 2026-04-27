import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Workspace metadata is the primary source — its objects carry
// universalIdentifier for both standard and installed-app objects.
// The manifest fallback only matters for marketplace browsing of
// custom objects from an app that isn't installed yet.
export const resolveObjectLabel = (
  uid: string | undefined | null,
  objectMetadataItemsByUniversalIdentifier: Map<
    string,
    EnrichedObjectMetadataItem
  >,
  manifest?: Manifest,
): string | undefined => {
  if (!isDefined(uid)) return undefined;

  const workspaceObject = objectMetadataItemsByUniversalIdentifier.get(uid);
  if (isDefined(workspaceObject)) return workspaceObject.labelSingular;

  return manifest?.objects.find((obj) => obj.universalIdentifier === uid)
    ?.labelSingular;
};
