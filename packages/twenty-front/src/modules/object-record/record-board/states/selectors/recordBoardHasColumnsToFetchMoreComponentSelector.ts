import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const recordBoardHasColumnsToFetchMoreComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'recordBoardHasColumnsToFetchMoreComponentSelector',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupDefinitions = get(
          recordGroupDefinitionsComponentSelector,
          { instanceId },
        );

        return recordGroupDefinitions.some((recordGroupDefinition) =>
          get(recordBoardShouldFetchMoreInColumnComponentFamilyState, {
            instanceId,
            familyKey: recordGroupDefinition.id,
          }),
        );
      },
  });
