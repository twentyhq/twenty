import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { recordGroupDefaultId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { tableRowIdsByGroupComponentSelector } from '@/object-record/record-table/states/selectors/tableRowIdsByGroupComponentSelector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';

export const useTableRowIds = (recordTableId?: string) => {
  const tableRowIdsState = useRecoilComponentCallbackStateV2(
    tableRowIdsByGroupComponentSelector,
    recordTableId,
  );

  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (recordGroupDefinitions.length === 0) {
          const tableRowIds = getSnapshotValue(
            snapshot,
            tableRowIdsState(recordGroupDefaultId),
          );

          return tableRowIds;
        }

        return recordGroupDefinitions
          .map((recordGroupDefinition) => {
            const tableRowIds = getSnapshotValue(
              snapshot,
              tableRowIdsState(recordGroupDefinition.id),
            );

            return tableRowIds;
          })
          .flat();
      },
    [recordGroupDefinitions, tableRowIdsState],
  );
};
