import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormMultiRecordFieldChips } from '@/object-record/record-field/ui/form-types/components/FormMultiRecordFieldChips';
import { useOpenFormMultiRecordPicker } from '@/object-record/record-field/ui/form-types/hooks/useOpenFormMultiRecordPicker';
import {
  type RecordId,
  type Variable,
} from '@/object-record/record-field/ui/form-types/types/RecordPickerValue';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import {
  type FormMultiRecordPickerDraftValue,
  getFormMultiRecordPickerDraftValue,
} from '@/object-record/record-field/ui/form-types/utils/getFormMultiRecordPickerDraftValue';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useId, useState } from 'react';
import { isNonEmptyArray } from '@sniptt/guards';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { IconChevronDown } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFormSelectContainerWrapper = styled.div<{ readonly?: boolean }>`
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  min-width: 0;
  width: 100%;
`;

const StyledIconButton = styled.div`
  display: flex;
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledDropdownContainer = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledVariablePickerContainer = styled.div`
  display: flex;
  flex-shrink: 0;
`;

export type FormMultiRecordPickerProps = {
  label?: string;
  defaultValue?: Array<RecordId | Variable> | Variable | string | null;
  onChange: (value: Array<RecordId | Variable> | Variable) => void;
  objectNameSingular: string;
  readonly?: boolean;
  testId?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormMultiRecordPicker = ({
  label,
  defaultValue,
  onChange,
  objectNameSingular,
  readonly,
  testId,
  VariablePicker,
}: FormMultiRecordPickerProps) => {
  const { theme } = useContext(ThemeContext);

  const [draftValue, setDraftValue] = useState<FormMultiRecordPickerDraftValue>(
    getFormMultiRecordPickerDraftValue(defaultValue),
  );

  const componentId = useId();
  const dropdownId = `form-multi-record-picker-${componentId}`;
  const variablesDropdownId = `form-multi-record-picker-${componentId}-variables`;

  const { closeDropdown } = useCloseDropdown();
  const { enqueueWarningSnackBar } = useSnackBar();
  const { openFormMultiRecordPicker } = useOpenFormMultiRecordPicker({
    objectNameSingular,
  });

  const staticRecordIds =
    draftValue.type === 'static'
      ? draftValue.value.filter((entry) => isValidUuid(entry))
      : [];

  const { records: selectedRecords } = useFindManyRecords({
    objectNameSingular,
    filter: { id: { in: staticRecordIds } },
    limit: Math.min(staticRecordIds.length, QUERY_MAX_RECORDS),
    skip: !isNonEmptyArray(staticRecordIds),
    withSoftDeleted: true,
  });

  const selectedRecordsById = mapArrayToObject(
    selectedRecords,
    (record) => record.id,
  );

  const orderedSelectedRecords = staticRecordIds
    .map((recordId) => selectedRecordsById[recordId])
    .filter(isDefined);

  const handleOpenDropdown = () => {
    if (draftValue.type !== 'static') {
      return;
    }

    openFormMultiRecordPicker({
      pickerInstanceId: dropdownId,
      selectedRecordIds: staticRecordIds,
      selectedRecords: orderedSelectedRecords,
    });
  };

  const handleMorphItemChange = (morphItem: RecordPickerPickableMorphItem) => {
    if (draftValue.type !== 'static') {
      return;
    }

    const valueWithoutRecord = draftValue.value.filter(
      (entry) => entry !== morphItem.recordId,
    );

    if (morphItem.isSelected) {
      const selectedRecordCount = valueWithoutRecord.filter((entry) =>
        isValidUuid(entry),
      ).length;

      if (selectedRecordCount >= QUERY_MAX_RECORDS) {
        enqueueWarningSnackBar({
          message: t`You can select at most ${QUERY_MAX_RECORDS} records.`,
        });

        return;
      }
    }

    const updatedValue = morphItem.isSelected
      ? [...valueWithoutRecord, morphItem.recordId]
      : valueWithoutRecord;

    setDraftValue({ type: 'static', value: updatedValue });
    onChange(updatedValue);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({ type: 'variable', value: variableName });
    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({ type: 'static', value: [] });
    onChange([]);
  };

  const handleRemoveStaticVariable = (variable: string) => {
    if (draftValue.type !== 'static') {
      return;
    }

    const updatedValue = draftValue.value.filter((entry) => entry !== variable);

    setDraftValue({ type: 'static', value: updatedValue });
    onChange(updatedValue);
  };

  const chips = (
    <FormMultiRecordFieldChips
      draftValue={draftValue}
      selectedRecords={orderedSelectedRecords}
      objectNameSingular={objectNameSingular}
      readonly={readonly}
      onUnlinkVariable={handleUnlinkVariable}
      onRemoveStaticVariable={handleRemoveStaticVariable}
    />
  );

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormFieldInputRowContainer>
        {readonly || draftValue.type === 'variable' ? (
          <StyledFormSelectContainerWrapper readonly={readonly}>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              {chips}
            </FormFieldInputInnerContainer>
          </StyledFormSelectContainerWrapper>
        ) : (
          <StyledDropdownContainer>
            <Dropdown
              dropdownId={dropdownId}
              dropdownPlacement="bottom-start"
              clickableComponentWidth="100%"
              onOpen={handleOpenDropdown}
              dropdownOffset={{
                y: parseInt(theme.spacing[1], 10),
              }}
              clickableComponent={
                <StyledFormSelectContainerWrapper>
                  <FormFieldInputInnerContainer
                    formFieldInputInstanceId={componentId}
                    hasRightElement={isDefined(VariablePicker) && !readonly}
                    hoverable
                    preventFocusStackUpdate={true}
                  >
                    {chips}
                    <StyledIconButton>
                      <IconChevronDown
                        size={theme.icon.size.md}
                        color={theme.font.color.light}
                      />
                    </StyledIconButton>
                  </FormFieldInputInnerContainer>
                </StyledFormSelectContainerWrapper>
              }
              dropdownComponents={
                <MultipleRecordPicker
                  componentInstanceId={dropdownId}
                  focusId={dropdownId}
                  onChange={handleMorphItemChange}
                  onSubmit={() => closeDropdown(dropdownId)}
                  onClickOutside={() => closeDropdown(dropdownId)}
                  dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                />
              }
            />
          </StyledDropdownContainer>
        )}
        {isDefined(VariablePicker) && !readonly && (
          <StyledVariablePickerContainer>
            <VariablePicker
              instanceId={variablesDropdownId}
              disabled={readonly}
              onVariableSelect={handleVariableTagInsert}
              shouldDisplayRecordObjects={true}
              shouldDisplayRecordFields={true}
              objectNameSingularsToSelect={[objectNameSingular]}
            />
          </StyledVariablePickerContainer>
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
