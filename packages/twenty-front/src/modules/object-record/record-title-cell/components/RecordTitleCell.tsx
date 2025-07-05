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
import { getRecordTitleCellId } from '@/object-record/record-title-cell/utils/getRecordTitleCellId';

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
  const { fieldDefinition, recordId, isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const { closeRecordTitleCell } = useRecordTitleCell();

  const handleEnter: FieldInputEvent = (persistField) => {
    closeRecordTitleCell({
      recordId,
      fieldMetadataId: fieldDefinition?.fieldMetadataId,
      containerType,
    });
    persistField();
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    closeRecordTitleCell({
      recordId,
      fieldMetadataId: fieldDefinition?.fieldMetadataId,
      containerType,
    });
    persistField();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    closeRecordTitleCell({
      recordId,
      fieldMetadataId: fieldDefinition?.fieldMetadataId,
      containerType,
    });
    persistField();
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    closeRecordTitleCell({
      recordId,
      fieldMetadataId: fieldDefinition?.fieldMetadataId,
      containerType,
    });
    persistField();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = (persistField) => {
    closeRecordTitleCell({
      recordId,
      fieldMetadataId: fieldDefinition?.fieldMetadataId,
      containerType,
    });
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
    isReadOnly,
    containerType,
  };

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordTitleCellId(
          recordId,
          fieldDefinition?.fieldMetadataId,
          containerType,
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
