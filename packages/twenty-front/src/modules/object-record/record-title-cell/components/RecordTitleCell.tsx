import { useContext } from 'react';
import { useIcons } from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';

import { useInlineCell } from '../../record-inline-cell/hooks/useInlineCell';

import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { RecordTitleCellContainer } from '@/object-record/record-title-cell/components/RecordTitleCellContainer';
import { RecordTitleCellFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellFieldDisplay';
import { RecordTitleCellFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellFieldInput';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilCallback } from 'recoil';
import {
  RecordInlineCellContext,
  RecordInlineCellContextProps,
} from '../../record-inline-cell/components/RecordInlineCellContext';

type RecordTitleCellProps = {
  readonly?: boolean;
  loading?: boolean;
};

export const RecordTitleCell = ({ loading }: RecordTitleCellProps) => {
  const { fieldDefinition, recordId, isCentered, isDisplayModeFixHeight } =
    useContext(FieldContext);
  const buttonIcon = useGetButtonIcon();

  const isFieldInputOnly = useIsFieldInputOnly();

  const isFieldReadOnly = useIsFieldValueReadOnly();

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
        const recordFieldDropdownId = getDropdownFocusIdForRecordField(
          recordId,
          fieldDefinition.fieldMetadataId,
          'inline-cell',
        );

        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (recordFieldDropdownId !== activeDropdownFocusId) {
          return;
        }

        event.stopImmediatePropagation();

        persistField();
        closeInlineCell();
      },
    [closeInlineCell, fieldDefinition.fieldMetadataId, recordId],
  );

  const { getIcon } = useIcons();

  const RecordInlineCellContextValue: RecordInlineCellContextProps = {
    readonly: isFieldReadOnly,
    buttonIcon: buttonIcon,
    customEditHotkeyScope: isFieldRelation(fieldDefinition)
      ? { scope: RelationPickerHotkeyScope.RelationPicker }
      : undefined,
    IconLabel: fieldDefinition.iconName
      ? getIcon(fieldDefinition.iconName)
      : undefined,
    label: fieldDefinition.label,
    labelWidth: fieldDefinition.labelWidth,
    showLabel: fieldDefinition.showLabel,
    isCentered,
    editModeContent: (
      <RecordTitleCellFieldInput
        recordFieldInputdId={getRecordFieldInputId(
          recordId,
          fieldDefinition?.metadata?.fieldName,
        )}
        onEnter={handleEnter}
        onCancel={handleCancel}
        onEscape={handleEscape}
        onSubmit={handleSubmit}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onClickOutside={handleClickOutside}
        isReadOnly={isFieldReadOnly}
      />
    ),
    displayModeContent: <RecordTitleCellFieldDisplay />,
    isDisplayModeFixHeight: isDisplayModeFixHeight,
    editModeContentOnly: isFieldInputOnly,
    loading: loading,
  };

  return (
    <FieldFocusContextProvider>
      <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
        <RecordTitleCellContainer />
      </RecordInlineCellContext.Provider>
    </FieldFocusContextProvider>
  );
};
