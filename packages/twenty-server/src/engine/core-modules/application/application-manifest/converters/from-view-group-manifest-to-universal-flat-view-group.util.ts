import { type ViewGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export const fromViewGroupManifestToUniversalFlatViewGroup = ({
  viewGroupManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewGroupManifest: ViewGroupManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewGroup => {
  return {
    universalIdentifier: viewGroupManifest.universalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    fieldValue: viewGroupManifest.fieldValue,
    isVisible: viewGroupManifest.isVisible ?? true,
    position: viewGroupManifest.position,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
