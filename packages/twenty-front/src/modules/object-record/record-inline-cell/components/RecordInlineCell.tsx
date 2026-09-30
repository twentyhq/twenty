import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';

import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';

import { useIcons } from 'twenty-ui/icon';
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

  const { openFieldInput, closeFieldInput } = useOpenFieldInputEditMode();

  const onOpenEditMode = onOpenEditModeFromContext
    ? onOpenEditModeFromContext
    : () =>
        openFieldInput({
          fieldDefinition,
          recordId,
          prefix: instanceIdPrefix,
        });

  const onCloseEditMode = onCloseEditModeFromContext
    ? onCloseEditModeFromContext
    : () =>
        closeFieldInput({
          fieldDefinition,
          recordId,
          prefix: instanceIdPrefix,
        });

  const buttonIcon = useGetButtonIcon();

  const isFieldInputOnly = useIsFieldInputOnly();

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
