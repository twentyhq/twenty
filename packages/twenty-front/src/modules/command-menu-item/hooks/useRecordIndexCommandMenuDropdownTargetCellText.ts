import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexCommandMenuDropdownTargetCellComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownTargetCellComponentState';
import { useFormatFieldValueAsPlainText } from '@/object-record/record-field/ui/hooks/useFormatFieldValueAsPlainText';
import { recordStoreFieldValueSelector } from '@/object-record/record-store/states/selectors/recordStoreFieldValueSelector';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useRecordIndexCommandMenuDropdownTargetCellText = (
  dropdownId: string,
) => {
  const targetCellAtom = useAtomComponentStateCallbackState(
    recordIndexCommandMenuDropdownTargetCellComponentState,
    dropdownId,
  );

  const targetCellWithValueAtom = useMemo(
    () =>
      atom((get) => {
        const targetCell = get(targetCellAtom);

        if (!isDefined(targetCell)) {
          return null;
        }

        const { recordId, fieldDefinition } = targetCell;

        return {
          fieldDefinition,
          fieldValue: get(
            recordStoreFieldValueSelector({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
              fieldDefinition,
            }),
          ),
        };
      }),
    [targetCellAtom],
  );

  const targetCellWithValue = useAtomValue(targetCellWithValueAtom);

  const { formatFieldValueAsPlainText } = useFormatFieldValueAsPlainText();

  if (!isDefined(targetCellWithValue)) {
    return '';
  }

  return formatFieldValueAsPlainText(
    targetCellWithValue.fieldDefinition,
    targetCellWithValue.fieldValue,
  );
};
