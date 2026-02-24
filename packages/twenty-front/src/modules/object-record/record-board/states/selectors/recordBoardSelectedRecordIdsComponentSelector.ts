import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelector } from '@/ui/utilities/state/jotai/utils/createComponentSelector';

export const recordBoardSelectedRecordIdsComponentSelector =
  createComponentSelector<string[]>({
    key: 'recordBoardSelectedRecordIdsSelector',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
          instanceId,
        });

        return allRecordIds.filter(
          (recordId) =>
            get(isRecordBoardCardSelectedComponentFamilyState, {
              instanceId,
              familyKey: recordId,
            }) === true,
        );
      },
  });
