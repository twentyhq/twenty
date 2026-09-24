import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findSystemReadableObjectNavigationCommandMenuItems = ({
  flatCommandMenuItems,
  flatObjectMetadataMaps,
}: {
  flatCommandMenuItems: (FlatCommandMenuItem | undefined)[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FlatCommandMenuItem[] =>
  flatCommandMenuItems.filter(
    (flatCommandMenuItem): flatCommandMenuItem is FlatCommandMenuItem => {
      if (
        !isDefined(flatCommandMenuItem) ||
        flatCommandMenuItem.engineComponentKey !==
          EngineComponentKey.NAVIGATION ||
        flatCommandMenuItem.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
        !isDefined(flatCommandMenuItem.navigationTargetObjectMetadataId)
      ) {
        return false;
      }

      const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatCommandMenuItem.navigationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      return (
        targetFlatObjectMetadata?.readability === MetadataReadability.SYSTEM
      );
    },
  );
