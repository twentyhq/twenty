import { type ViewFieldManifest } from 'twenty-shared/application';

import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const fromViewFieldManifestToUniversalFlatViewField = ({
  viewFieldManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewFieldManifest: ViewFieldManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewField => {
  return {
    universalIdentifier: viewFieldManifest.universalIdentifier,
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      viewFieldManifest.fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    viewFieldGroupUniversalIdentifier:
      viewFieldManifest.viewFieldGroupUniversalIdentifier ?? null,
    isVisible: viewFieldManifest.isVisible ?? true,
    size: viewFieldManifest.size ?? 0,
    position: viewFieldManifest.position,
    aggregateOperation: viewFieldManifest.aggregateOperation ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
