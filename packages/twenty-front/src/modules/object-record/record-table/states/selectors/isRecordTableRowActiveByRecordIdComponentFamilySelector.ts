import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const isRecordTableRowActiveByRecordIdComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, string>({
    key: 'isRecordTableRowActiveByRecordIdComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const rowIndex = get(
          recordTableRowIndexOfRecordComponentFamilySelector,
          {
            instanceId,
            familyKey,
          },
        );

        return (
          isDefined(rowIndex) &&
          get(isRecordTableRowActiveComponentFamilyState, {
            instanceId,
            familyKey: rowIndex,
          })
        );
      },
  });
