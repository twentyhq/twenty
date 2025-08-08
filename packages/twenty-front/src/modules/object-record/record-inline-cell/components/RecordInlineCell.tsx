import { useCallback, useContext } from 'react';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';

import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/hooks/useOpenFieldInputEditMode';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { isInlineCellInEditModeFamilyState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeFamilyState';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { RecordInlineCellContainer } from './RecordInlineCellContainer';
import {
  RecordInlineCellContext,
  RecordInlineCellContextProps,
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

  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const setIsInlineCellInEditMode = useSetRecoilState(
    isInlineCellInEditModeFamilyState(recordFieldComponentInstanceId),
  );

  const closeInlineCell = useCallback(() => {
    onCloseEditMode();
    setIsInlineCellInEditMode(false);
    goBackToPreviousDropdownFocusId();
  }, [
    onCloseEditMode,
    setIsInlineCellInEditMode,
    goBackToPreviousDropdownFocusId,
  ]);

  const handleEnter: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    persistField();
    closeInlineCell();
  };

  const handleCancel = () => {
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
        const currentDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        const expectedDropdownFocusId = getDropdownFocusIdForRecordField(
          recordId,
          fieldDefinition.fieldMetadataId,
          'inline-cell',
        );

        if (currentDropdownFocusId !== expectedDropdownFocusId) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();

        persistField();
        closeInlineCell();
      },
    [closeInlineCell, recordId, fieldDefinition.fieldMetadataId],
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
    editModeContent: (
      <FieldInput
        onEnter={handleEnter}
        onCancel={handleCancel}
        onEscape={handleEscape}
        onSubmit={handleSubmit}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onClickOutside={handleClickOutside}
        isReadOnly={isReadOnly}
      />
    ),
    displayModeContent: <FieldDisplay />,
    isDisplayModeFixHeight: isDisplayModeFixHeight,
    editModeContentOnly: isFieldInputOnly,
    loading: loading,
    onOpenEditMode,
    onCloseEditMode,
  };

  return (
    <FieldFocusContextProvider>
      <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
        <RecordInlineCellContainer />
      </RecordInlineCellContext.Provider>
    </FieldFocusContextProvider>
  );
};
