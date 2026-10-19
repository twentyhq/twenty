import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const recordTableRowIndexByRecordIdComponentSelector =
  createAtomComponentSelector<Map<string, number>>({
    key: 'recordTableRowIndexByRecordIdComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
          instanceId,
        });

        const rowIndexByRecordId = new Map<string, number>();

        allRecordIds.forEach((recordId, rowIndex) => {
          if (isDefined(recordId)) {
            rowIndexByRecordId.set(recordId, rowIndex);
          }
        });

        return rowIndexByRecordId;
      },
  });
