import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';

import { useInlineCell } from '../../record-inline-cell/hooks/useInlineCell';

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
  sizeVariant?: 'xs' | 'md';
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
    closeInlineCell();
    persistField();
  };

  const handleEscape = () => {
    closeInlineCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    closeInlineCell();
    persistField();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    closeInlineCell();
    persistField();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = (
    persistField,
    event,
  ) => {
    event.stopImmediatePropagation();
    closeInlineCell();
    persistField();
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
