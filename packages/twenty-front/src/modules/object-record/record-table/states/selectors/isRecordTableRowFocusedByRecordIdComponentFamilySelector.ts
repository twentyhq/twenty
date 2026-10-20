import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const isRecordTableRowFocusedByRecordIdComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, string>({
    key: 'isRecordTableRowFocusedByRecordIdComponentFamilySelector',
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
          get(isRecordTableRowFocusedComponentFamilyState, {
            instanceId,
            familyKey: rowIndex,
          })
        );
      },
  });
