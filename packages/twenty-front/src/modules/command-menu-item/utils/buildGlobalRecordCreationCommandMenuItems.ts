import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

type BuildGlobalRecordCreationCommandMenuItemsParams = {
  activeObjectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    | 'id'
    | 'labelSingular'
    | 'icon'
    | 'isUICreatable'
    | 'isUIEditable'
    | 'isRemote'
    | 'writability'
  >[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  createRecordCommand: CommandMenuItemDefinition;
  getLabel: (objectLabelSingular: string) => string;
};

export const buildGlobalRecordCreationCommandMenuItems = ({
  activeObjectMetadataItems,
  objectPermissionsByObjectMetadataId,
  createRecordCommand,
  getLabel,
}: BuildGlobalRecordCreationCommandMenuItemsParams): CommandMenuItemDefinition[] => {
  return activeObjectMetadataItems
    .filter((objectMetadataItem) => {
      const permissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      );

      return (
        permissions.canReadObjectRecords &&
        canCreateRecordsForObjectMetadataItem({
          objectMetadataItem,
          objectPermissions: permissions,
        })
      );
    })
    .map((objectMetadataItem): CommandMenuItemDefinition => {
      const objectLabelSingular = capitalize(objectMetadataItem.labelSingular);

      return {
        ...createRecordCommand,
        id: `${createRecordCommand.id}-${objectMetadataItem.id}`,
        label: getLabel(objectLabelSingular),
        icon: objectMetadataItem.icon,
        shortLabel: null,
        isPinned: false,
        hotKeys: null,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        availabilityObjectMetadataId: null,
        conditionalAvailabilityExpression: null,
        conditionalPinnedExpression: null,
        navigationTargetObjectMetadataId: null,
        creationTargetObjectMetadataId: objectMetadataItem.id,
      };
    });
};
