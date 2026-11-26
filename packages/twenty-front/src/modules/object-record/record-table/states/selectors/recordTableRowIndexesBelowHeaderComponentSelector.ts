import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const recordTableRowIndexesBelowHeaderComponentSelector =
  createAtomComponentSelector<number[]>({
    key: 'recordTableRowIndexesBelowHeaderComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        if (!get(hasRecordGroupsComponentSelector, { instanceId })) {
          return [0];
        }

        const rowIndexesBelowHeader: number[] = [];
        let firstRowIndexOfRecordGroup = 0;

        for (const recordGroupId of get(recordGroupIdsComponentState, {
          instanceId,
        })) {
          rowIndexesBelowHeader.push(firstRowIndexOfRecordGroup);

          firstRowIndexOfRecordGroup += get(
            recordIndexRecordIdsByGroupComponentFamilyState,
            { instanceId, familyKey: recordGroupId },
          ).length;
        }

        return rowIndexesBelowHeader;
      },
  });
