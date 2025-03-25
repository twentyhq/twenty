import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';

import { useInlineCell } from '../../record-inline-cell/hooks/useInlineCell';

import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTitleCellContainer } from '@/object-record/record-title-cell/components/RecordTitleCellContainer';
import {
  RecordTitleCellContext,
  RecordTitleCellContextProps,
} from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { RecordTitleCellFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellFieldDisplay';
import { RecordTitleCellFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellFieldInput';
import { getRecordTitleCellId } from '@/object-record/record-title-cell/utils/getRecordTitleCellId';

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

  const { closeInlineCell } = useInlineCell(
    getRecordTitleCellId(recordId, fieldDefinition?.fieldMetadataId),
  );

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

  const handleClickOutside: FieldInputClickOutsideEvent = (
    persistField,
    event,
  ) => {
    event.stopImmediatePropagation();

    persistField();
    closeInlineCell();
  };

  const recordTitleCellContextValue: RecordTitleCellContextProps = {
    editModeContent: (
      <RecordTitleCellFieldInput
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
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordTitleCellId(
          recordId,
          fieldDefinition?.fieldMetadataId,
        ),
      }}
    >
      <FieldFocusContextProvider>
        <RecordTitleCellContext.Provider value={recordTitleCellContextValue}>
          <RecordTitleCellContainer />
        </RecordTitleCellContext.Provider>
      </FieldFocusContextProvider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
