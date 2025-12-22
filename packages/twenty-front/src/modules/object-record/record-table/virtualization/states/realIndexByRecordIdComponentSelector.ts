import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const realIndexByRecordIdComponentSelector = createComponentSelector<{
  realIndexByRecordIdMap: Map<string, number>;
}>({
  key: 'realIndexByRecordIdComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const totalNumberOfRecordsToVirtualize = get(
        totalNumberOfRecordsToVirtualizeComponentState.atomFamily({
          instanceId,
        }),
      );

      const realIndexByRecordIdMap = new Map<string, number>();

      if (!isDefined(totalNumberOfRecordsToVirtualize)) {
        return { realIndexByRecordIdMap };
      }

      for (
        let realIndex = 0;
        realIndex < totalNumberOfRecordsToVirtualize;
        realIndex++
      ) {
        const recordId = get(
          recordIdByRealIndexComponentFamilyState.atomFamily({
            instanceId,
            familyKey: { realIndex },
          }),
        );

        if (isDefined(recordId)) {
          realIndexByRecordIdMap.set(recordId, realIndex);
        }
      }

      return { realIndexByRecordIdMap };
    },
});
