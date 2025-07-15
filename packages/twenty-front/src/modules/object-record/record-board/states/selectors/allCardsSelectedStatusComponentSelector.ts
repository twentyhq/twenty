import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { AllRowsSelectedStatus } from '@/object-record/record-table/types/AllRowSelectedStatus';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const allCardsSelectedStatusComponentSelector =
  createComponentSelectorV2<AllRowsSelectedStatus>({
    key: 'allCardsSelectedStatusComponentSelector',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        const selectedRecordIds = get(
          recordBoardSelectedRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        const numberOfSelectedCards = selectedRecordIds.length;

        const allCardsSelectedStatus =
          numberOfSelectedCards === 0
            ? 'none'
            : selectedRecordIds.length === allRecordIds.length
              ? 'all'
              : 'some';

        return allCardsSelectedStatus;
      },
  });
