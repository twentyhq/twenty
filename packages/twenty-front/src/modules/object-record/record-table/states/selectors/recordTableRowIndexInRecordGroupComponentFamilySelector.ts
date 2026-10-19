import { isDefined } from 'twenty-shared/utils';

import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableRowIndexByRecordIdInRecordGroupComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexByRecordIdInRecordGroupComponentFamilySelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const recordTableRowIndexInRecordGroupComponentFamilySelector =
  createAtomComponentFamilySelector<
    number | null,
    { recordGroupId: string | undefined; recordId: string }
  >({
    key: 'recordTableRowIndexInRecordGroupComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey: { recordGroupId, recordId } }) =>
      ({ get }) => {
        if (!isDefined(recordGroupId)) {
          return null;
        }

        return (
          get(
            recordTableRowIndexByRecordIdInRecordGroupComponentFamilySelector,
            { instanceId, familyKey: recordGroupId },
          ).get(recordId) ?? null
        );
      },
  });
