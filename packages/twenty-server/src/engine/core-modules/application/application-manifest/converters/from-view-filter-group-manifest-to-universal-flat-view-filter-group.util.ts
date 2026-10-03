import { type ViewFilterGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';

export const fromViewFilterGroupManifestToUniversalFlatViewFilterGroup = ({
  viewFilterGroupManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewFilterGroupManifest: ViewFilterGroupManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewFilterGroup => {
  return {
    universalIdentifier: viewFilterGroupManifest.universalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    parentViewFilterGroupUniversalIdentifier:
      viewFilterGroupManifest.parentViewFilterGroupUniversalIdentifier ?? null,
    logicalOperator: viewFilterGroupManifest.logicalOperator,
    positionInViewFilterGroup:
      viewFilterGroupManifest.positionInViewFilterGroup ?? null,
    childViewFilterGroupUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
