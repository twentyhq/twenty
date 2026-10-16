import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

// Row focus indexes are global across groups, in recordGroupIds order, so a
// group's first row sits after every record of the groups before it.
export const recordIndexGroupRowIndexOffsetComponentFamilySelector =
  createAtomComponentFamilySelector<number, RecordGroupDefinition['id']>({
    key: 'recordIndexGroupRowIndexOffsetComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey: recordGroupId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        let rowIndexOffset = 0;

        for (const currentRecordGroupId of recordGroupIds) {
          if (currentRecordGroupId === recordGroupId) {
            break;
          }

          rowIndexOffset += get(
            recordIndexRecordIdsByGroupComponentFamilyState,
            {
              instanceId,
              familyKey: currentRecordGroupId,
            },
          ).length;
        }

        return rowIndexOffset;
      },
  });
