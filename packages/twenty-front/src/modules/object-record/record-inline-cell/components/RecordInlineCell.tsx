import { useContext } from 'react';
import { useIcons } from 'twenty-ui';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';

import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/hooks/useOpenFieldInputEditMode';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { SelectFieldHotkeyScope } from '@/object-record/select/types/SelectFieldHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useRecoilCallback } from 'recoil';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
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
        if (hotkeyScope.scope !== InlineCellHotkeyScope.InlineCell) {
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

  // TODO: deprecate this and use useOpenFieldInput hooks to set the hotkey scope
  const computedHotkeyScope = (
    columnDefinition: FieldDefinition<FieldMetadata>,
  ) => {
    if (isFieldRelation(columnDefinition)) {
      if (
        columnDefinition.metadata.relationType ===
        RelationDefinitionType.MANY_TO_ONE
      ) {
        return SingleRecordPickerHotkeyScope.SingleRecordPicker;
      }

      if (
        columnDefinition.metadata.relationType ===
        RelationDefinitionType.ONE_TO_MANY
      ) {
        return MultipleRecordPickerHotkeyScope.MultipleRecordPicker;
      }

      return SingleRecordPickerHotkeyScope.SingleRecordPicker;
    }

    if (isFieldSelect(columnDefinition)) {
      return SelectFieldHotkeyScope.SelectField;
    }

    return undefined;
  };

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
    customEditHotkeyScope: computedHotkeyScope(fieldDefinition),
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
