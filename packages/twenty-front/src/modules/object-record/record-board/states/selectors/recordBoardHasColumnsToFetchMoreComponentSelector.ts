import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

// True while at least one column still has more records to load.
// The in-view sentinel signal (recordBoardShouldFetchMoreComponentState) stays
// latched high across the whole loaded board, so on its own it cannot tell the
// fetch-more loop when to stop. This selector is the loop terminator: once every
// column's per-column flag has been set to false (each returned a partial or
// empty page), paging stops instead of spinning on empty fetches — which matters
// for boards shorter than the prefetch buffer, where the sentinel never leaves
// view.
//
// It mirrors exactly the set of columns useTriggerRecordBoardFetchMore iterates
// (recordGroupDefinitions, keyed by definition id), so "has columns to fetch" is
// true iff the next fetch would actually request at least one column.
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
