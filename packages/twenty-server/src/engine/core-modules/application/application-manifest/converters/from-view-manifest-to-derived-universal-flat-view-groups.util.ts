import {
  getViewGroupUniversalIdentifier,
  type ViewManifest,
} from 'twenty-shared/application';

import { computeUniversalFlatViewGroupsForGroupByField } from 'src/engine/metadata-modules/flat-view-group/utils/compute-universal-flat-view-groups-for-group-by-field.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

// A manifest view that groups by a field (e.g. a Kanban board) is unusable
// without view groups, so when the manifest declares none they are derived
// from the group-by field's options. Universal identifiers are deterministic
// (application + view + fieldValue) so every sync recomputes the exact same
// groups: the first sync creates them, later syncs diff them against the
// workspace instead of deleting entities missing from the manifest.
export const fromViewManifestToDerivedUniversalFlatViewGroups = ({
  viewManifest,
  mainGroupByFlatFieldMetadata,
  applicationUniversalIdentifier,
  now,
}: {
  viewManifest: ViewManifest;
  mainGroupByFlatFieldMetadata: Pick<
    UniversalFlatFieldMetadata,
    'options' | 'isNullable'
  >;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewGroup[] =>
  computeUniversalFlatViewGroupsForGroupByField({
    viewUniversalIdentifier: viewManifest.universalIdentifier,
    mainGroupByFlatFieldMetadata,
    applicationUniversalIdentifier,
    generateUniversalIdentifier: ({ fieldValue }) =>
      getViewGroupUniversalIdentifier({
        applicationUniversalIdentifier,
        viewUniversalIdentifier: viewManifest.universalIdentifier,
        fieldValue,
      }),
    now,
  });
