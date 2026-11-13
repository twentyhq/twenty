import { type ViewTabManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';

export const fromFlatViewTabToViewTabManifest = ({
  flatViewTab,
}: {
  flatViewTab: UniversalFlatViewTab;
}): ViewTabManifest => ({
  universalIdentifier: flatViewTab.universalIdentifier,
  type: flatViewTab.type,
  ...(isDefined(flatViewTab.fieldValue)
    ? { fieldValue: flatViewTab.fieldValue }
    : {}),
  ...(isDefined(flatViewTab.name) ? { name: flatViewTab.name } : {}),
  position: flatViewTab.position,
  isVisible: flatViewTab.isVisible,
});
