import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const findSystemReadableObjectNavigationCommandMenuItems = ({
  flatCommandMenuItems,
  systemReadableObjectMetadataIds,
}: {
  flatCommandMenuItems: (FlatCommandMenuItem | undefined)[];
  systemReadableObjectMetadataIds: Set<string>;
}): FlatCommandMenuItem[] =>
  flatCommandMenuItems.filter(
    (flatCommandMenuItem): flatCommandMenuItem is FlatCommandMenuItem =>
      isDefined(flatCommandMenuItem) &&
      flatCommandMenuItem.engineComponentKey ===
        EngineComponentKey.NAVIGATION &&
      flatCommandMenuItem.applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
      isDefined(flatCommandMenuItem.navigationTargetObjectMetadataId) &&
      systemReadableObjectMetadataIds.has(
        flatCommandMenuItem.navigationTargetObjectMetadataId,
      ),
  );
