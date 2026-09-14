import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const useGlobalRecordCreationCommandMenuItems = (
  commandMenuItems: CommandMenuItemDefinition[],
) => {
  const { t } = useLingui();
  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const createRecordCommand = commandMenuItems.find(
    (item) =>
      item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
      !isDefined(item.availabilityObjectMetadataId),
  );

  if (!isRecordCreationFormEnabled || !isDefined(createRecordCommand)) {
    return {
      isRecordCreationFormEnabled,
      globalRecordCreationCommandMenuItems: [],
    };
  }

  const globalRecordCreationCommandMenuItems = activeObjectMetadataItems
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
        label: t`Create ${objectLabelSingular}`,
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

  return { isRecordCreationFormEnabled, globalRecordCreationCommandMenuItems };
};
