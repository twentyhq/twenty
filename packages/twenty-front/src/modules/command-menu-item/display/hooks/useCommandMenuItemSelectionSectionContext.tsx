import { useContext } from 'react';
import {
  isDefined,
  isNonEmptyArray,
  isNonEmptyString,
  resolveObjectMetadataLabel,
} from 'twenty-shared/utils';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemSelectionRecordStack } from '@/command-menu-item/display/components/CommandMenuItemSelectionRecordStack';
import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { contextStoreRecordIdsInSelectionOrderComponentState } from '@/context-store/states/contextStoreRecordIdsInSelectionOrderComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { orderRecordIdsBySelection } from '@/context-store/utils/orderRecordIdsBySelection';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const MAX_STACKED_RECORDS = 3;

export const useCommandMenuItemSelectionSectionContext = ():
  | CommandMenuItemSectionContext
  | undefined => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { objectMetadataItem } = useContextStoreObjectMetadataItem();
  const { identifierChipGeneratorPerObject } = useContext(
    PreComputedChipGeneratorsContext,
  );

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  // Select-all targets records that may not be loaded, so only an explicit
  // selection has avatars to show.
  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const contextStoreRecordIdsInSelectionOrder = useAtomComponentStateValue(
    contextStoreRecordIdsInSelectionOrderComponentState,
  );

  // Pages that do not track the selection order fall back on view order.
  const recordIdsInSelectionOrder = orderRecordIdsBySelection({
    previousRecordIdsInSelectionOrder: contextStoreRecordIdsInSelectionOrder,
    selectedRecordIds,
  });

  const recordIdsWithAvatar =
    recordIdsInSelectionOrder.slice(-MAX_STACKED_RECORDS);

  const records = useAtomFamilySelectorValue(recordStoreRecordsSelector, {
    recordIds: recordIdsWithAvatar,
  });

  const { numberOfSelectedRecords } = commandMenuContextApi;

  if (!isDefined(objectMetadataItem) || numberOfSelectedRecords === 0) {
    return undefined;
  }

  const [firstRecord] = records;

  const singleRecordName =
    numberOfSelectedRecords === 1 && isDefined(firstRecord)
      ? getObjectRecordIdentifier({
          objectMetadataItem,
          record: firstRecord,
          allowRequestsToTwentyIcons,
        }).name
      : undefined;

  const label = isNonEmptyString(singleRecordName)
    ? singleRecordName
    : `${numberOfSelectedRecords} ${resolveObjectMetadataLabel({
        objectMetadataItem,
        numberOfSelectedRecords,
      })}`;

  // Record avatars come from the object's identifier chip, which objects
  // without a label identifier field do not have.
  const canShowRecordAvatars =
    isNonEmptyArray(records) &&
    isDefined(
      identifierChipGeneratorPerObject[objectMetadataItem.nameSingular],
    );

  return {
    icon: canShowRecordAvatars ? (
      <CommandMenuItemSelectionRecordStack
        objectMetadataItem={objectMetadataItem}
        records={records}
      />
    ) : undefined,
    label,
  };
};
