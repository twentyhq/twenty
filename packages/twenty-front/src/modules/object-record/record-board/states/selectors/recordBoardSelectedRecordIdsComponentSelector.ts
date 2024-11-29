import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordIndexAllRowIdsComponentState } from '@/object-record/record-index/states/recordIndexAllRowIdsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const recordBoardSelectedRecordIdsComponentSelector =
  createComponentSelectorV2<string[]>({
    key: 'recordBoardSelectedRecordIdsSelector',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRowIds = get(
          recordIndexAllRowIdsComponentState.atomFamily({ instanceId }),
        );

        return allRowIds.filter(
          (recordId) =>
            get(
              isRecordBoardCardSelectedComponentFamilyState.atomFamily({
                instanceId,
                familyKey: recordId,
              }),
            ) === true,
        );
      },
  });
