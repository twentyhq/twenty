import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useResetPreviousCommandMenuContext } from '@/command-menu/hooks/useResetPreviousCommandMenuContext';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconTwentyCheckbox, isDefined } from 'twenty-ui';

export const ResetContextToSelectionCommandButton = () => {
  const contextStoreTargetedRecordsRuleComponent = useRecoilComponentValueV2(
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

  const { records, loading, totalCount } =
    useFindManyRecordsSelectedInContextStore({
      instanceId: 'command-menu-previous',
      limit: 1,
    });

  if (
    !isDefined(objectMetadataItem) ||
    contextStoreTargetedRecordsRuleComponent.mode !== 'selection' ||
    contextStoreTargetedRecordsRuleComponent.selectedRecordIds.length === 0 ||
    loading ||
    !totalCount
  ) {
    return null;
  }

  const selectedRecordsContextText = getSelectedRecordsContextText(
    objectMetadataItem,
    records,
    totalCount,
  );

  return (
    <CommandMenuItem
      id="reset-context-to-selection"
      Icon={IconTwentyCheckbox}
      label={t`Reset context to ${selectedRecordsContextText}`}
      onClick={resetPreviousCommandMenuContext}
    />
  );
};
