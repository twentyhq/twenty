import { type CommandMenuItemManifest } from 'twenty-shared/application';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

const AVAILABILITY_TYPE_MAP: Record<
  NonNullable<CommandMenuItemManifest['availabilityType']>,
  CommandMenuItemAvailabilityType
> = {
  GLOBAL: CommandMenuItemAvailabilityType.GLOBAL,
  SINGLE_RECORD: CommandMenuItemAvailabilityType.SINGLE_RECORD,
  BULK_RECORDS: CommandMenuItemAvailabilityType.BULK_RECORDS,
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
    icon: commandMenuItemManifest.icon ?? null,
    isPinned: commandMenuItemManifest.isPinned ?? false,
    availabilityType: commandMenuItemManifest.availabilityType
      ? AVAILABILITY_TYPE_MAP[commandMenuItemManifest.availabilityType]
      : CommandMenuItemAvailabilityType.GLOBAL,
    frontComponentUniversalIdentifier:
      commandMenuItemManifest.frontComponentUniversalIdentifier,
    availabilityObjectMetadataUniversalIdentifier:
      commandMenuItemManifest.availabilityObjectUniversalIdentifier ?? null,
    workflowVersionId: null,
    createdAt: now,
    updatedAt: now,
  };
};
