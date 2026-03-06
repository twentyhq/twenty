import { type ViewFilterManifest } from 'twenty-shared/application';

import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';

export const fromViewFilterManifestToUniversalFlatViewFilter = ({
  viewFilterManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewFilterManifest: ViewFilterManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewFilter => {
  return {
    universalIdentifier: viewFilterManifest.universalIdentifier,
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      viewFilterManifest.fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    viewFilterGroupUniversalIdentifier:
      viewFilterManifest.viewFilterGroupUniversalIdentifier ?? null,
    operand: viewFilterManifest.operand,
    value: viewFilterManifest.value,
    subFieldName: viewFilterManifest.subFieldName ?? null,
    positionInViewFilterGroup:
      viewFilterManifest.positionInViewFilterGroup ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
