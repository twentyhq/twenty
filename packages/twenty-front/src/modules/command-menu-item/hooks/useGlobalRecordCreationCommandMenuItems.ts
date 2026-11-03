import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { useCommandMenuItemConditionalDisplay } from '@/command-menu-item/hooks/useCommandMenuItemConditionalDisplay';
import { buildGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/buildGlobalRecordCreationCommandMenuItems';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const useGlobalRecordCreationCommandMenuItems = (
  commandMenuItems: CommandMenuItemDefinition[],
) => {
  const { t } = useLingui();
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { doesCommandMenuItemMatchConditionalDisplay } =
    useCommandMenuItemConditionalDisplay(EMPTY_COMMAND_MENU_CONTEXT_API);
  const createRecordCommand = commandMenuItems.find(
    (item) =>
      item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
      !isDefined(item.availabilityObjectMetadataId),
  );

  const hasGlobalRecordCreationCommandTemplate =
    isDefined(createRecordCommand) &&
    doesCommandMenuItemMatchConditionalDisplay(createRecordCommand);
  const globalRecordCreationCommandMenuItems = useMemo(() => {
    if (
      !isDefined(createRecordCommand) ||
      !hasGlobalRecordCreationCommandTemplate
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
    createRecordCommand,
    hasGlobalRecordCreationCommandTemplate,
    activeObjectMetadataItems,
    objectPermissionsByObjectMetadataId,
    t,
  ]);

  return {
    hasGlobalRecordCreationCommandTemplate,
    globalRecordCreationCommandMenuItems,
  };
};
