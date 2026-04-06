import { useCallback, useContext, useState } from 'react';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';

import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import {
  RecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { FieldWidgetInlineCellContainer } from '@/page-layout/widgets/field/components/FieldWidgetInlineCellContainer';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { fieldWidgetHoverComponentState } from '@/page-layout/widgets/field/states/fieldWidgetHoverComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';

type FieldWidgetInlineCellProps = {
  loading?: boolean;
  instanceIdPrefix?: string;
};

export const FieldWidgetInlineCell = ({
  loading,
  instanceIdPrefix: _instanceIdPrefix,
}: FieldWidgetInlineCellProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();
  const store = useStore();
  const [isEditModeOpen, setIsEditModeOpen] = useState(false);
  const {
    fieldDefinition,
    recordId,
    isCentered,
    isDisplayModeFixHeight,
    onOpenEditMode: onOpenEditModeFromContext,
    onCloseEditMode: onCloseEditModeFromContext,
    isRecordFieldReadOnly: isReadOnly,
  } = useContext(FieldContext);

  const { openFieldInput, closeFieldInput } =
    useOpenFieldWidgetFieldInputEditMode();
  const initFieldInputDraftValue = useInitDraftValue();
  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const setFieldWidgetHover = useSetAtomComponentState(
    fieldWidgetHoverComponentState,
  );

  const onOpenEditMode = onOpenEditModeFromContext
    ? onOpenEditModeFromContext
    : () => {
        setFieldWidgetHover(false);
        setIsEditModeOpen(true);
        initFieldInputDraftValue({
          recordId,
          fieldDefinition,
        });
        const dropdownId = getDropdownFocusIdForRecordField({
          recordId,
          fieldMetadataId: fieldDefinition.fieldMetadataId,
          componentType: 'inline-cell',
          instanceId: scopeInstanceId,
        });
        setActiveDropdownFocusIdAndMemorizePrevious(dropdownId);
        openFieldInput({
          fieldDefinition,
          recordId,
        });
      };

  const onCloseEditMode = useCallback(() => {
    setIsEditModeOpen(false);
    onCloseEditModeFromContext ? onCloseEditModeFromContext() : closeFieldInput();
  }, [
    onCloseEditModeFromContext,
    closeFieldInput,
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

  const handleClickOutside = useCallback(
    ({
      event,
      newValue,
      skipPersist,
    }: Parameters<FieldInputClickOutsideEvent>[0]) => {
      const currentDropdownFocusId = store.get(activeDropdownFocusIdState.atom);

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
      closeInlineCell,
      recordId,
      fieldDefinition.fieldMetadataId,
      persistFieldFromFieldInputContext,
      scopeInstanceId,
      store,
    ],
  );

  const RecordInlineCellContextValue: RecordInlineCellContextProps = {
    readonly: isReadOnly,
    buttonIcon: buttonIcon,
    label: fieldDefinition.label,
    labelWidth: fieldDefinition.labelWidth,
    editModeContent: <FieldInput />,
    displayModeContent: <FieldDisplay />,
    isDisplayModeFixHeight: isDisplayModeFixHeight,
    editModeContentOnly: isFieldInputOnly,
    loading: loading,
    isCentered,
    isEditModeOpen,
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
          <FieldWidgetInlineCellContainer />
        </RecordInlineCellContext.Provider>
      </FieldFocusContextProvider>
    </FieldInputEventContext.Provider>
  );
};
