import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';

import { useInlineCell } from '../../record-inline-cell/hooks/useInlineCell';

import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { RecordTitleCellContainer } from '@/object-record/record-title-cell/components/RecordTitleCellContainer';
import {
  RecordTitleCellContext,
  RecordTitleCellContextProps,
} from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { RecordTitleCellFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellFieldDisplay';
import { RecordTitleCellFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellFieldInput';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilCallback } from 'recoil';

type RecordTitleCellProps = {
  loading?: boolean;
  sizeVariant?: 'sm' | 'md';
};

export const RecordTitleCell = ({
  loading,
  sizeVariant,
}: RecordTitleCellProps) => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const { closeInlineCell } = useInlineCell();

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleEscape = () => {
    closeInlineCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = useRecoilCallback(
    ({ snapshot }) =>
      (persistField, event) => {
        const recordFieldDropdownId = getDropdownFocusIdForRecordField(
          recordId,
          fieldDefinition.fieldMetadataId,
          'inline-cell',
        );

        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (recordFieldDropdownId !== activeDropdownFocusId) {
          return;
        }

        event.stopImmediatePropagation();

        persistField();
        closeInlineCell();
      },
    [closeInlineCell, fieldDefinition.fieldMetadataId, recordId],
  );

  const recordTitleCellContextValue: RecordTitleCellContextProps = {
    editModeContent: (
      <RecordTitleCellFieldInput
        recordFieldInputId={getRecordFieldInputId(
          recordId,
          fieldDefinition?.metadata?.fieldName,
        )}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onClickOutside={handleClickOutside}
        sizeVariant={sizeVariant}
      />
    ),
    displayModeContent: <RecordTitleCellFieldDisplay />,
    editModeContentOnly: isFieldInputOnly,
    loading: loading,
  };

  return (
    <FieldFocusContextProvider>
      <RecordTitleCellContext.Provider value={recordTitleCellContextValue}>
        <RecordTitleCellContainer />
      </RecordTitleCellContext.Provider>
    </FieldFocusContextProvider>
  );
};
