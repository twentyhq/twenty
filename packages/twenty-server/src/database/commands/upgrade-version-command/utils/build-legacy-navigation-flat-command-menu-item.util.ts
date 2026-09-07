import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { NAVIGATION_INTERPOLATED_ICON, NAVIGATION_INTERPOLATED_LABEL, NAVIGATION_INTERPOLATED_SHORT_LABEL, buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

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
    conditionalPinnedExpression: null,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: {
      objectMetadataItemId: objectMetadata.id,
    } as unknown as FlatCommandMenuItem['payload'],
    navigationTargetObjectMetadataId: null,
    navigationTargetObjectMetadataUniversalIdentifier: null,
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
