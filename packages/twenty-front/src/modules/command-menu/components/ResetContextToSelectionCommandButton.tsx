import { SidePanelContextRecordsChip } from '@/side-panel/components/SidePanelContextRecordsChip';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useResetPreviousCommandMenuContext } from '@/command-menu/hooks/useResetPreviousCommandMenuContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowBackUp } from 'twenty-ui/display';

export const ResetContextToSelectionCommandButton = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
  );

  const { resetPreviousCommandMenuContext } =
    useResetPreviousCommandMenuContext();

  if (
    !isDefined(objectMetadataItem) ||
    (contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0)
  ) {
    return null;
  }

  return (
    <SelectableListItem
      itemId={RESET_CONTEXT_TO_SELECTION}
      onEnter={resetPreviousCommandMenuContext}
    >
      <CommandMenuItem
        id={RESET_CONTEXT_TO_SELECTION}
        Icon={IconArrowBackUp}
        label={t`Reset to`}
        RightComponent={
          <SidePanelContextRecordsChip
            objectMetadataItemId={objectMetadataItem.id}
            instanceId={SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID}
          />
        }
        onClick={resetPreviousCommandMenuContext}
      />
    </SelectableListItem>
  );
};
