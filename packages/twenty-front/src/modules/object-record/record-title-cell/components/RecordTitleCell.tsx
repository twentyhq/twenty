import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTitleCellContainer } from '@/object-record/record-title-cell/components/RecordTitleCellContainer';
import {
  RecordTitleCellContext,
  RecordTitleCellContextProps,
} from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { RecordTitleCellFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellFieldDisplay';
import { RecordTitleCellFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellFieldInput';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

type RecordTitleCellProps = {
  loading?: boolean;
  sizeVariant?: 'xs' | 'md';
  containerType: RecordTitleCellContainerType;
};

export const RecordTitleCell = ({
  loading,
  sizeVariant,
  containerType,
}: RecordTitleCellProps) => {
  const { fieldDefinition, recordId, isRecordFieldReadOnly } =
    useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const { closeRecordTitleCell } = useRecordTitleCell();

  const closeCell = () => {
    closeRecordTitleCell({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      containerType,
    });
  };

  const handleEnter: FieldInputEvent = (persistField) => {
    closeCell();
    persistField();
  };

  const handleEscape = () => {
    closeCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    closeCell();
    persistField();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    closeCell();
    persistField();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = (persistField) => {
    closeCell();
    persistField();
  };

  const recordTitleCellContextValue: RecordTitleCellContextProps = {
    editModeContent: (
      <RecordTitleCellFieldInput
        instanceId={getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix: containerType,
        })}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onClickOutside={handleClickOutside}
        sizeVariant={sizeVariant}
      />
    ),
    displayModeContent: (
      <RecordTitleCellFieldDisplay containerType={containerType} />
    ),
    editModeContentOnly: isFieldInputOnly,
    loading: loading,
    isReadOnly: isRecordFieldReadOnly,
    containerType,
  };

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix: containerType,
        }),
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
