import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
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

const RecordInlineCellTargetedRecordCommandMenuItems = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  // Availability and the click both read the context store selection, so the
  // buttons only make sense where that selection is this exact record.
  const isRecordTargeted =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1 &&
    contextStoreTargetedRecordsRule.selectedRecordIds[0] === recordId;

  if (!isRecordTargeted) {
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

export const RecordInlineCellCommandMenuItems = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);

  // Inline cells also render outside a context store (e.g. isolated
  // previews); there is no targeted record there to act on.
  const contextStoreInstanceContext = useComponentInstanceStateContext(
    ContextStoreComponentInstanceContext,
  );

  const hasFieldCommandMenuItems = commandMenuItems.some(
    (commandMenuItem) =>
      commandMenuItem.availabilityFieldMetadataId ===
      fieldDefinition.fieldMetadataId,
  );

  if (!hasFieldCommandMenuItems || !contextStoreInstanceContext) {
    return null;
  }

  return <RecordInlineCellTargetedRecordCommandMenuItems />;
};
