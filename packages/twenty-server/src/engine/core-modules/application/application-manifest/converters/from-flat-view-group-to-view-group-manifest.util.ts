import { type ViewGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export const fromFlatViewGroupToViewGroupManifest = ({
  flatViewGroup,
}: {
  flatViewGroup: UniversalFlatViewGroup;
}): ViewGroupManifest => ({
  universalIdentifier: flatViewGroup.universalIdentifier,
  fieldValue: flatViewGroup.fieldValue,
  position: flatViewGroup.position,
  isVisible: flatViewGroup.isVisible,
});
