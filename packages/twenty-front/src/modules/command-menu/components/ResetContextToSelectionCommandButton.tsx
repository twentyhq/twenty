import { CommandMenuContextRecordsChip } from '@/command-menu/components/CommandMenuContextRecordsChip';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useResetPreviousCommandMenuContext } from '@/command-menu/hooks/useResetPreviousCommandMenuContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowBackUp } from 'twenty-ui/display';

export const ResetContextToSelectionCommandButton = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
    'command-menu-previous',
  );

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    'command-menu-previous',
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
          <CommandMenuContextRecordsChip
            objectMetadataItemId={objectMetadataItem.id}
            instanceId={COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID}
          />
        }
        onClick={resetPreviousCommandMenuContext}
      />
    </SelectableListItem>
  );
};
