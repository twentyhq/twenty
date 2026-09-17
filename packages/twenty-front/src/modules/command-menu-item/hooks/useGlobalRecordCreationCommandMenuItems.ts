import { buildGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/buildGlobalRecordCreationCommandMenuItems';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

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

  const hasGlobalRecordCreationCommandTemplate = isDefined(createRecordCommand);
  const globalRecordCreationCommandMenuItems = useMemo(() => {
    if (!isRecordCreationFormEnabled || !isDefined(createRecordCommand)) {
      return [];
    }

    return buildGlobalRecordCreationCommandMenuItems({
      activeObjectMetadataItems,
      objectPermissionsByObjectMetadataId,
      createRecordCommand,
      getLabel: (objectLabelSingular) => t`Create ${objectLabelSingular}`,
    });
  }, [
    isRecordCreationFormEnabled,
    createRecordCommand,
    activeObjectMetadataItems,
    objectPermissionsByObjectMetadataId,
    t,
  ]);

  return {
    isRecordCreationFormEnabled,
    hasGlobalRecordCreationCommandTemplate,
    globalRecordCreationCommandMenuItems,
  };
};
