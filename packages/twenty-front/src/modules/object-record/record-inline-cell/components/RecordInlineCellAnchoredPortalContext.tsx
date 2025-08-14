import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import {
  RecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useContext, type ReactNode } from 'react';
import { useIcons } from 'twenty-ui/display';

type RecordInlineCellAnchoredPortalContextProps = {
  children: ReactNode;
};

export const RecordInlineCellAnchoredPortalContext = ({
  children,
}: RecordInlineCellAnchoredPortalContextProps) => {
  const {
    isRecordFieldReadOnly,
    fieldDefinition,
    isDisplayModeFixHeight,
    onOpenEditMode,
    onCloseEditMode,
    isCentered,
  } = useContext(FieldContext);
  const buttonIcon = useGetButtonIcon();
  const { getIcon } = useIcons();
  const isFieldInputOnly = useIsFieldInputOnly();

  const RecordInlineCellContextValue: RecordInlineCellContextProps = {
    readonly: isRecordFieldReadOnly,
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
    loading: false,
    onOpenEditMode,
    onCloseEditMode,
  };

  return (
    <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
      {children}
    </RecordInlineCellContext.Provider>
  );
};
