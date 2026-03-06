import { type ViewFieldGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';

export const fromViewFieldGroupManifestToUniversalFlatViewFieldGroup = ({
  viewFieldGroupManifest,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  viewFieldGroupManifest: ViewFieldGroupManifest;
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewFieldGroup => {
  return {
    universalIdentifier: viewFieldGroupManifest.universalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    name: viewFieldGroupManifest.name ?? '',
    position: viewFieldGroupManifest.position,
    isVisible: viewFieldGroupManifest.isVisible ?? true,
    viewFieldUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
