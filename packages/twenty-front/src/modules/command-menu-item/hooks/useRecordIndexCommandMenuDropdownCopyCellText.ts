import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexCommandMenuDropdownTargetCellComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownTargetCellComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFormatFieldValueAsPlainText } from '@/object-record/record-field/ui/hooks/useFormatFieldValueAsPlainText';
import { hasFieldCopyAction } from '@/object-record/record-field/ui/utils/hasFieldCopyAction';
import { isJunctionRelationFieldDefinition } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationFieldDefinition';
import { recordStoreFieldValueSelector } from '@/object-record/record-store/states/selectors/recordStoreFieldValueSelector';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useRecordIndexCommandMenuDropdownCopyCellText = (
  dropdownId: string,
) => {
  const targetCellAtom = useAtomComponentStateCallbackState(
    recordIndexCommandMenuDropdownTargetCellComponentState,
    dropdownId,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const targetCellWithValueAtom = useMemo(
    () =>
      atom((get) => {
        const targetCell = get(targetCellAtom);

        if (
          !isDefined(targetCell) ||
          hasFieldCopyAction(targetCell.fieldDefinition) ||
          isJunctionRelationFieldDefinition({
            fieldDefinition: targetCell.fieldDefinition,
            objectMetadataItems,
          })
        ) {
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
    [targetCellAtom, objectMetadataItems],
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
