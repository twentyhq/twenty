import { type ViewSortManifest } from 'twenty-shared/application';

import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';

export const fromViewSortManifestToUniversalFlatViewSort = ({
  viewSortManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewSortManifest: ViewSortManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewSort => {
  return {
    universalIdentifier: viewSortManifest.universalIdentifier,
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      viewSortManifest.fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    direction: viewSortManifest.direction,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
