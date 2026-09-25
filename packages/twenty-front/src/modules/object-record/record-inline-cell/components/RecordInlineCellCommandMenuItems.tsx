import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';

const RecordInlineCellCommandMenuItemButtons = ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}) => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return commandMenuItems
    .filter(
      (commandMenuItem) =>
        commandMenuItem.availabilityFieldMetadataId === fieldMetadataId,
    )
    .map((commandMenuItem) => (
      <CommandMenuItemRenderer
        key={commandMenuItem.id}
        item={commandMenuItem}
      />
    ));
};

export const RecordInlineCellCommandMenuItems = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const hasFieldCommandMenuItems = commandMenuItems.some(
    (commandMenuItem) =>
      commandMenuItem.availabilityFieldMetadataId ===
      fieldDefinition.fieldMetadataId,
  );

  // Availability and the click both read the context store selection, so the
  // buttons only make sense where that selection is this exact record.
  const isRecordTargeted =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1 &&
    contextStoreTargetedRecordsRule.selectedRecordIds[0] === recordId;

  if (!hasFieldCommandMenuItems || !isRecordTargeted) {
    return null;
  }

  return (
    <CommandMenuContextProvider
      displayType="button"
      containerType={CommandMenuItemContainerType.RecordField}
    >
      <RecordInlineCellCommandMenuItemButtons
        fieldMetadataId={fieldDefinition.fieldMetadataId}
      />
    </CommandMenuContextProvider>
  );
};
