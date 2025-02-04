import { CommandMenuContextRecordChip } from '@/command-menu/components/CommandMenuContextRecordChip';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useResetPreviousCommandMenuContext } from '@/command-menu/hooks/useResetPreviousCommandMenuContext';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconArrowBackUp } from 'twenty-ui';

export const ResetContextToSelectionCommandButton = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    'command-menu-previous',
  );

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
    'command-menu-previous',
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataId,
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
    <CommandMenuItem
      id={RESET_CONTEXT_TO_SELECTION}
      Icon={IconArrowBackUp}
      label={t`Reset to`}
      RightComponent={
        <CommandMenuContextRecordChip
          objectMetadataItemId={objectMetadataItem.id}
          instanceId="command-menu-previous"
        />
      }
      onClick={resetPreviousCommandMenuContext}
    />
  );
};
