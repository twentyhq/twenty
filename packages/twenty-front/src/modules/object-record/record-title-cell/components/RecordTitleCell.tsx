import { useCallback, useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';

import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTitleCellContainer } from '@/object-record/record-title-cell/components/RecordTitleCellContainer';
import {
  RecordTitleCellContext,
  type RecordTitleCellContextProps,
} from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { RecordTitleCellFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellFieldDisplay';
import { RecordTitleCellFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellFieldInput';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellComponentInstanceContext } from '@/object-record/record-title-cell/states/contexts/RecordTitleCellComponentInstanceContext';
import { type RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecoilCallback } from 'recoil';

type RecordTitleCellProps = {
  loading?: boolean;
  sizeVariant?: 'xs' | 'sm' | 'md';
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

  const closeCell = useCallback(() => {
    closeRecordTitleCell(
      getRecordFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
        prefix: containerType,
      }),
    );
  }, [
    closeRecordTitleCell,
    containerType,
    fieldDefinition.metadata.fieldName,
    recordId,
  ]);

  const { persistFieldFromFieldInputContext } =
    usePersistFieldFromFieldInputContext();

  const handleEnter: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeCell();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = useRecoilCallback(
    () =>
      ({ newValue, skipPersist }) => {
        if (skipPersist !== true) {
          persistFieldFromFieldInputContext(newValue);
        }

        closeCell();
      },
    [closeCell, persistFieldFromFieldInputContext],
  );

  const handleEscape: FieldInputEvent = () => {
    closeCell();
  };

  const handleTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeCell();
  };

  const handleShiftTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeCell();
  };

  const recordTitleCellContextValue: RecordTitleCellContextProps = {
    editModeContent: (
      <FieldInputEventContext.Provider
        value={{
          onClickOutside: handleClickOutside,
          onEnter: handleEnter,
          onEscape: handleEscape,
          onShiftTab: handleShiftTab,
          onTab: handleTab,
        }}
      >
        <RecordTitleCellFieldInput
          instanceId={getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
            prefix: containerType,
          })}
          sizeVariant={sizeVariant}
        />
      </FieldInputEventContext.Provider>
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
      <RecordTitleCellComponentInstanceContext.Provider
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
      </RecordTitleCellComponentInstanceContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
