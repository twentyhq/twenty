import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { allRecordIdsOfAllRecordGroupsComponentSelector } from '@/object-record/record-index/states/selectors/allRecordIdsOfAllRecordGroupsComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { type AllRowsSelectedStatus } from '@/object-record/record-table/types/AllRowSelectedStatus';

export const allCardsSelectedStatusComponentSelector =
  createAtomComponentSelector<AllRowsSelectedStatus>({
    key: 'allCardsSelectedStatusComponentSelector',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(
          allRecordIdsOfAllRecordGroupsComponentSelector,
          { instanceId },
        );

        const selectedRecordIds = get(
          recordBoardSelectedRecordIdsComponentSelector,
          { instanceId },
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
