import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  buildNavigationConditionalAvailabilityExpression,
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

// Frozen copy of the pre-2.31 navigation command identifier scheme, kept so
// committed upgrade commands (1-21, 2-10, 2-17) preserve their historical
// behavior after buildNavigationFlatCommandMenuItem moved to
// getNavigationCommandUniversalIdentifier. The 2-31 re-own command migrates
// rows minted under this scheme onto the derived identifier.
export const LEGACY_NAVIGATION_COMMAND_UUID_NAMESPACE =
  'b31830da-2ae0-48eb-a915-12fa4ab96dd3';

export const getLegacyNavigationCommandUniversalIdentifier = (
  objectUniversalIdentifier: string,
): string =>
  v5(objectUniversalIdentifier, LEGACY_NAVIGATION_COMMAND_UUID_NAMESPACE);

export const buildLegacyNavigationFlatCommandMenuItem = ({
  objectMetadata,
  commandMenuItemId,
  applicationId,
  applicationUniversalIdentifier,
  workspaceId,
  position,
  now,
}: {
  objectMetadata: {
    id: string;
    universalIdentifier: string;
    nameSingular: string;
    shortcut: string | null;
  };
  commandMenuItemId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  position: number;
  now: string;
}): FlatCommandMenuItem => {
  const universalIdentifier = getLegacyNavigationCommandUniversalIdentifier(
    objectMetadata.universalIdentifier,
  );

  const conditionalAvailabilityExpression =
    buildNavigationConditionalAvailabilityExpression({
      universalIdentifier: objectMetadata.universalIdentifier,
      nameSingular: objectMetadata.nameSingular,
    });

  return {
    id: commandMenuItemId,
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier,
    workspaceId,
    label: NAVIGATION_INTERPOLATED_LABEL,
    shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
    icon: NAVIGATION_INTERPOLATED_ICON,
    position,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: { objectMetadataItemId: objectMetadata.id },
    hotKeys: isDefined(objectMetadata.shortcut)
      ? ['G', objectMetadata.shortcut]
      : null,
    workflowVersionId: null,
    availabilityObjectMetadataId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    isActive: true,
    isSystemSideEffect: true,
    overrides: null,
    universalOverrides: null,
    createdAt: now,
    updatedAt: now,
  };
};
