import { useDoesCommandMenuItemMatchConditionalDisplay } from '@/command-menu-item/hooks/useDoesCommandMenuItemMatchConditionalDisplay';
import { buildGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/buildGlobalRecordCreationCommandMenuItems';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  EngineComponentKey,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';

export const useGlobalRecordCreationCommandMenuItems = (
  commandMenuItems: CommandMenuItemDefinition[],
) => {
  const { t } = useLingui();
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );
  const { doesCommandMenuItemMatchConditionalDisplay } =
    useDoesCommandMenuItemMatchConditionalDisplay();
  const createRecordCommand = commandMenuItems.find(
    (item) =>
      item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
      !isDefined(item.availabilityObjectMetadataId),
  );
  const isCreateRecordCommandDisplayed =
    isDefined(createRecordCommand) &&
    doesCommandMenuItemMatchConditionalDisplay(createRecordCommand);

  const hasGlobalRecordCreationCommandTemplate =
    isRecordCreationFormEnabled && isCreateRecordCommandDisplayed;
  const globalRecordCreationCommandMenuItems = useMemo(() => {
    if (
      !isRecordCreationFormEnabled ||
      !isDefined(createRecordCommand) ||
      !isCreateRecordCommandDisplayed
    ) {
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
    isCreateRecordCommandDisplayed,
    activeObjectMetadataItems,
    objectPermissionsByObjectMetadataId,
    t,
  ]);

  return {
    hasGlobalRecordCreationCommandTemplate,
    globalRecordCreationCommandMenuItems,
  };
};
