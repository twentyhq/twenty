import { type CommandMenuItemManifest } from 'twenty-shared/application';

import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

export const fromCommandMenuItemManifestToUniversalFlatCommandMenuItem = ({
  commandMenuItemManifest,
  applicationUniversalIdentifier,
  now,
}: {
  commandMenuItemManifest: CommandMenuItemManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatCommandMenuItem => {
  return {
    universalIdentifier: commandMenuItemManifest.universalIdentifier,
    applicationUniversalIdentifier,
    label: commandMenuItemManifest.label,
    shortLabel: commandMenuItemManifest.shortLabel ?? null,
    position: 0,
    icon: commandMenuItemManifest.icon ?? null,
    isPinned: commandMenuItemManifest.isPinned ?? false,
    availabilityType: (commandMenuItemManifest.availabilityType ??
      CommandMenuItemAvailabilityType.GLOBAL) as CommandMenuItemAvailabilityType,
    conditionalAvailabilityExpression:
      commandMenuItemManifest.conditionalAvailabilityExpression ?? null,
    conditionalPinnedExpression:
      commandMenuItemManifest.conditionalPinnedExpression ?? null,
    frontComponentUniversalIdentifier:
      commandMenuItemManifest.frontComponentUniversalIdentifier,
    availabilityObjectMetadataUniversalIdentifier:
      commandMenuItemManifest.availabilityObjectUniversalIdentifier ?? null,
    navigationTargetObjectMetadataUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
    payload: null,
    hotKeys: null,
    workflowVersionId: null,
    pageLayoutUniversalIdentifier: null,
    isActive: true,
    isSystemSideEffect: false,
    universalOverrides: null,
    createdAt: now,
    updatedAt: now,
  };
};
