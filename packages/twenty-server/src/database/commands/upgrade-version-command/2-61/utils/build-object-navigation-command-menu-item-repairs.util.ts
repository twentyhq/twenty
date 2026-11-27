import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectNavigationCommandMenuItemRepair } from 'src/database/commands/upgrade-version-command/2-61/types/object-navigation-command-menu-item-repair.type';
import { getLegacyNavigationCommandUniversalIdentifier } from 'src/database/commands/upgrade-version-command/utils/build-legacy-navigation-flat-command-menu-item.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type NavigationCommandMenuItem = Pick<
  FlatCommandMenuItem,
  | 'id'
  | 'applicationUniversalIdentifier'
  | 'engineComponentKey'
  | 'navigationTargetObjectMetadataId'
>;

type NavigationTargetObjectMetadata = Pick<
  FlatObjectMetadata,
  | 'id'
  | 'universalIdentifier'
  | 'applicationUniversalIdentifier'
  | 'nameSingular'
>;

type NavigationCommandMenuItemByUniversalIdentifier = Partial<
  Record<string, NavigationCommandMenuItem>
>;

const isTargetlessNavigationCommandOfApplication = ({
  commandMenuItem,
  applicationUniversalIdentifier,
}: {
  commandMenuItem: NavigationCommandMenuItem;
  applicationUniversalIdentifier: string;
}): boolean =>
  commandMenuItem.applicationUniversalIdentifier ===
    applicationUniversalIdentifier &&
  commandMenuItem.engineComponentKey === EngineComponentKey.NAVIGATION &&
  !isDefined(commandMenuItem.navigationTargetObjectMetadataId);

const buildObjectNavigationCommandMenuItemRepair = ({
  flatObjectMetadata,
  commandMenuItemByUniversalIdentifier,
}: {
  flatObjectMetadata: NavigationTargetObjectMetadata;
  commandMenuItemByUniversalIdentifier: NavigationCommandMenuItemByUniversalIdentifier;
}): ObjectNavigationCommandMenuItemRepair | undefined => {
  const { applicationUniversalIdentifier } = flatObjectMetadata;

  const derivedUniversalIdentifier =
    getSystemNavigationCommandMenuItemUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    });

  const derivedCommandMenuItem =
    commandMenuItemByUniversalIdentifier[derivedUniversalIdentifier];

  const legacyCommandMenuItem =
    commandMenuItemByUniversalIdentifier[
      getLegacyNavigationCommandUniversalIdentifier(
        flatObjectMetadata.universalIdentifier,
      )
    ];

  const update = {
    navigationTargetObjectMetadataId: flatObjectMetadata.id,
    payload: null,
    conditionalAvailabilityExpression:
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier: flatObjectMetadata.universalIdentifier,
        nameSingular: flatObjectMetadata.nameSingular,
      }),
  };

  if (isDefined(derivedCommandMenuItem)) {
    return isTargetlessNavigationCommandOfApplication({
      commandMenuItem: derivedCommandMenuItem,
      applicationUniversalIdentifier,
    })
      ? { id: derivedCommandMenuItem.id, update }
      : undefined;
  }

  if (
    !isDefined(legacyCommandMenuItem) ||
    !isTargetlessNavigationCommandOfApplication({
      commandMenuItem: legacyCommandMenuItem,
      applicationUniversalIdentifier,
    })
  ) {
    return undefined;
  }

  return {
    id: legacyCommandMenuItem.id,
    update: { ...update, universalIdentifier: derivedUniversalIdentifier },
  };
};

export const buildObjectNavigationCommandMenuItemRepairs = ({
  flatCommandMenuItemMaps,
  flatObjectMetadataMaps,
}: {
  flatCommandMenuItemMaps: {
    byUniversalIdentifier: NavigationCommandMenuItemByUniversalIdentifier;
  };
  flatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, NavigationTargetObjectMetadata>
    >;
  };
}): ObjectNavigationCommandMenuItemRepair[] =>
  Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .map((flatObjectMetadata) =>
      buildObjectNavigationCommandMenuItemRepair({
        flatObjectMetadata,
        commandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
      }),
    )
    .filter(isDefined);
