import { type CommandMenuItemManifest } from 'twenty-shared/application';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

const AVAILABILITY_TYPE_MAP: Record<
  NonNullable<CommandMenuItemManifest['availabilityType']>,
  CommandMenuItemAvailabilityType
> = {
  GLOBAL: CommandMenuItemAvailabilityType.GLOBAL,
  RECORD_SELECTION: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  FALLBACK: CommandMenuItemAvailabilityType.FALLBACK,
};

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
    availabilityType: commandMenuItemManifest.availabilityType
      ? AVAILABILITY_TYPE_MAP[commandMenuItemManifest.availabilityType]
      : CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression:
      commandMenuItemManifest.conditionalAvailabilityExpression ?? null,
    frontComponentUniversalIdentifier:
      commandMenuItemManifest.frontComponentUniversalIdentifier,
    availabilityObjectMetadataUniversalIdentifier:
      commandMenuItemManifest.availabilityObjectUniversalIdentifier ?? null,
    engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
    hotKeys: null,
    workflowVersionId: null,
    createdAt: now,
    updatedAt: now,
  };
};
