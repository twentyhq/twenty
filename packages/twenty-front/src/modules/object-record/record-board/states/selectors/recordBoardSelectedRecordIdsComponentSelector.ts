import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const recordBoardSelectedRecordIdsComponentSelector =
  createComponentSelectorV2<string[]>({
    key: 'recordBoardSelectedRecordIdsSelector',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(
          // TODO: This selector use a context different from the one used in the snippet
          // its working for now as the instanceId is the same but we should change this
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        return allRecordIds.filter(
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
