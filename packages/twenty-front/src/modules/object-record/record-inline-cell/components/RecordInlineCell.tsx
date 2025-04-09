import { useContext } from 'react';

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

import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useRecoilCallback } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { RecordInlineCellContainer } from './RecordInlineCellContainer';
import {
  RecordInlineCellContext,
  RecordInlineCellContextProps,
} from './RecordInlineCellContext';

type RecordInlineCellProps = {
  readonly?: boolean;
  loading?: boolean;
};

export const RecordInlineCell = ({ loading }: RecordInlineCellProps) => {
  const {
    fieldDefinition,
    recordId,
    isCentered,
    isDisplayModeFixHeight,
    onOpenEditMode,
    onCloseEditMode,
    isReadOnly,
  } = useContext(FieldContext);

  const buttonIcon = useGetButtonIcon();

  const isFieldInputOnly = useIsFieldInputOnly();

  const { closeInlineCell } = useInlineCell();

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
        const hotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();
        if (hotkeyScope.scope !== DEFAULT_CELL_SCOPE.scope) {
          return;
        }
        event.stopImmediatePropagation();

        persistField();
        closeInlineCell();
      },
    [closeInlineCell],
  );

  const { getIcon } = useIcons();
  const { openFieldInput, closeFieldInput } = useOpenFieldInputEditMode();

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
    onOpenEditMode:
      onOpenEditMode ?? (() => openFieldInput({ fieldDefinition, recordId })),
    onCloseEditMode: onCloseEditMode ?? (() => closeFieldInput()),
  };

  return (
    <FieldFocusContextProvider>
      <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
        <RecordInlineCellContainer />
      </RecordInlineCellContext.Provider>
    </FieldFocusContextProvider>
  );
};
