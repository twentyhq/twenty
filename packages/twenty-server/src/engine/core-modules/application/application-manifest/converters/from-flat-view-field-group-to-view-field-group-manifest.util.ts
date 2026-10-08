import { type ViewFieldGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';

export const fromFlatViewFieldGroupToViewFieldGroupManifest = ({
  flatViewFieldGroup,
}: {
  flatViewFieldGroup: UniversalFlatViewFieldGroup;
}): ViewFieldGroupManifest => ({
  universalIdentifier: flatViewFieldGroup.universalIdentifier,
  name: flatViewFieldGroup.name,
  position: flatViewFieldGroup.position,
  isVisible: flatViewFieldGroup.isVisible,
});
