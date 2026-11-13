import { type ViewTabManifest } from 'twenty-shared/application';

import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';

export const fromViewTabManifestToUniversalFlatViewTab = ({
  viewTabManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewTabManifest: ViewTabManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewTab => {
  return {
    universalIdentifier: viewTabManifest.universalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    type: viewTabManifest.type,
    fieldValue: viewTabManifest.fieldValue ?? null,
    name: viewTabManifest.name ?? null,
    isVisible: viewTabManifest.isVisible ?? true,
    position: viewTabManifest.position,
    viewFilterUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
