import { type ViewFilterManifest } from 'twenty-shared/application';
import { ViewFilterOperand } from 'twenty-shared/types';

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
  if (
    viewFilterManifest.operand === ViewFilterOperand.IS_RELATIVE &&
    typeof viewFilterManifest.value !== 'string'
  ) {
    throw new Error(
      `ViewFilterManifest with operand IS_RELATIVE requires a stringified relative date value (e.g., "NEXT_10_DAY"), but received a non-string value.`,
    );
  }

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
    relationTargetFieldMetadataUniversalIdentifier: null,
    positionInViewFilterGroup:
      viewFilterManifest.positionInViewFilterGroup ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
