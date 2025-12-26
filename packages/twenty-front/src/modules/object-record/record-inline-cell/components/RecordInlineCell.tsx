import { useCallback, useContext } from 'react';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';

import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';

import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilCallback } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { RecordInlineCellContainer } from './RecordInlineCellContainer';
import {
  RecordInlineCellContext,
  type RecordInlineCellContextProps,
} from './RecordInlineCellContext';

type RecordInlineCellProps = {
  loading?: boolean;
  instanceIdPrefix?: string;
};

export const RecordInlineCell = ({
  loading,
  instanceIdPrefix,
}: RecordInlineCellProps) => {
  const {
    fieldDefinition,
    recordId,
    isCentered,
    isDisplayModeFixHeight,
    onOpenEditMode: onOpenEditModeFromContext,
    onCloseEditMode: onCloseEditModeFromContext,
    isRecordFieldReadOnly: isReadOnly,
  } = useContext(FieldContext);
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();

  const { openFieldInput, closeFieldInput } = useOpenFieldInputEditMode();

  const onOpenEditMode = onOpenEditModeFromContext
    ? onOpenEditModeFromContext
    : () =>
        openFieldInput({
          fieldDefinition,
          recordId,
          prefix: instanceIdPrefix,
        });

  const onCloseEditMode = useCallback(() => {
    onCloseEditModeFromContext
      ? onCloseEditModeFromContext()
      : closeFieldInput({
          fieldDefinition,
          recordId,
          prefix: instanceIdPrefix,
        });
  }, [
    onCloseEditModeFromContext,
    closeFieldInput,
    fieldDefinition,
    recordId,
    instanceIdPrefix,
  ]);

  const buttonIcon = useGetButtonIcon();

  const isFieldInputOnly = useIsFieldInputOnly();

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const closeInlineCell = useCallback(() => {
    onCloseEditMode();
    goBackToPreviousDropdownFocusId();
  }, [onCloseEditMode, goBackToPreviousDropdownFocusId]);

  const { persistFieldFromFieldInputContext } =
    usePersistFieldFromFieldInputContext();

  const handleEnter: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleSubmit: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleCancel = () => {
    closeInlineCell();
  };

  const handleEscape: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleShiftTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      ({
        event,
        newValue,
        skipPersist,
      }: Parameters<FieldInputClickOutsideEvent>[0]) => {
        const currentDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        const expectedDropdownFocusId = getDropdownFocusIdForRecordField({
          recordId,
          fieldMetadataId: fieldDefinition.fieldMetadataId,
          componentType: 'inline-cell',
          instanceId: scopeInstanceId,
        });

        if (currentDropdownFocusId !== expectedDropdownFocusId) {
          return;
        }

        event?.preventDefault();
        event?.stopImmediatePropagation();

        if (skipPersist !== true) {
          persistFieldFromFieldInputContext(newValue);
        }

        closeInlineCell();
      },
    [
      recordId,
      fieldDefinition.fieldMetadataId,
      scopeInstanceId,
      closeInlineCell,
      persistFieldFromFieldInputContext,
    ],
  );

  const { getIcon } = useIcons();

  const RecordInlineCellContextValue: RecordInlineCellContextProps = {
    readonly: isReadOnly,
    buttonIcon: buttonIcon,
    IconLabel: fieldDefinition.iconName
      ? getIcon(fieldDefinition.iconName)
      : undefined,
    label: fieldDefinition.label,
    labelWidth: fieldDefinition.labelWidth,
    showLabel: fieldDefinition.showLabel,
    isCentered,
    editModeContent: <FieldInput />,
    displayModeContent: <FieldDisplay />,
    isDisplayModeFixHeight: isDisplayModeFixHeight,
    editModeContentOnly: isFieldInputOnly,
    loading: loading,
    onOpenEditMode,
    onCloseEditMode,
  };

  return (
    <FieldInputEventContext.Provider
      value={{
        onCancel: handleCancel,
        onEnter: handleEnter,
        onEscape: handleEscape,
        onClickOutside: handleClickOutside,
        onShiftTab: handleShiftTab,
        onSubmit: handleSubmit,
        onTab: handleTab,
      }}
    >
      <FieldFocusContextProvider>
        <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
          <RecordInlineCellContainer />
        </RecordInlineCellContext.Provider>
      </FieldFocusContextProvider>
    </FieldInputEventContext.Provider>
  );
};
