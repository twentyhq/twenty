import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormSingleRecordFieldChip } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordFieldChip';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useId } from 'react';
import { CustomError, isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconChevronDown, IconForbid } from 'twenty-ui/display';

const StyledFormSelectContainer = styled(FormFieldInputInnerContainer)<{
  readonly?: boolean;
}>`
  align-items: center;
  height: 32px;
  justify-content: space-between;
  padding-right: ${({ theme }) => theme.spacing(2)};

  ${({ readonly, theme }) =>
    !readonly &&
    css`
      &:hover,
      &[data-open='true'] {
        background-color: ${theme.background.transparent.light};
      }

      cursor: pointer;
    `}
`;

const StyledIconButton = styled.div`
  display: flex;
`;

export type RecordId = string;
export type Variable = string;

type FormSingleRecordPickerValue =
  | {
      type: 'static';
      value: RecordId;
    }
  | {
      type: 'variable';
      value: Variable;
    };

export type FormSingleRecordPickerProps = {
  label?: string;
  defaultValue?: RecordId | Variable;
  onChange: (value: RecordId | Variable | null) => void;
  objectNameSingulars: string[];
  disabled?: boolean;
  testId?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormSingleRecordPicker = ({
  label,
  defaultValue,
  objectNameSingulars,
  onChange,
  disabled,
  testId,
  VariablePicker,
}: FormSingleRecordPickerProps) => {
  const theme = useTheme();
  const draftValue: FormSingleRecordPickerValue = isStandaloneVariableString(
    defaultValue,
  )
    ? {
        type: 'variable',
        value: defaultValue,
      }
    : {
        type: 'static',
        value: defaultValue || '',
      };

  if (objectNameSingulars.length === 0) {
    throw new CustomError(
      'Object is missing while building form single record picker',
      'FORM_SINGLE_RECORD_PICKER_OBJECT_NAME_SINGULAR_IS_MISSING',
    );
  }

  const { record: selectedRecord } = useFindOneRecord({
    objectRecordId:
      isDefined(defaultValue) && !isStandaloneVariableString(defaultValue)
        ? defaultValue
        : '',
    objectNameSingular: objectNameSingulars[0],
    withSoftDeleted: true,
    skip: !isDefined(defaultValue) || !isValidUuid(defaultValue),
  });

  const componentId = useId();
  const dropdownId = `form-record-picker-${componentId}`;
  const variablesDropdownId = `form-record-picker-${componentId}-variables`;

  const { closeDropdown } = useCloseDropdown();

  const setRecordPickerSearchFilter = useSetRecoilComponentState(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRecordPickerSearchFilter('');
  }, [setRecordPickerSearchFilter]);

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (!isNonEmptyString(selectedMorphItem?.recordId)) {
      onChange(null);

      return;
    }

    onChange(selectedMorphItem.recordId);
    closeDropdown(dropdownId);
  };

  const handleVariableTagInsert = (variable: string) => {
    onChange?.(variable);
  };

  const handleUnlinkVariable = (event?: React.MouseEvent<HTMLDivElement>) => {
    // Prevents the dropdown to open when clicking on the chip
    event?.stopPropagation();
    onChange(null);
  };

  const setRecordPickerSelectedId = useSetRecoilComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleOpenDropdown = () => {
    if (
      isDefined(draftValue?.value) &&
      !isStandaloneVariableString(draftValue.value)
    ) {
      setRecordPickerSelectedId(draftValue.value);
    }
  };

  const objectNames = objectNameSingulars.join(' or ');

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormFieldInputRowContainer>
        {disabled ? (
          <StyledFormSelectContainer
            formFieldInputInstanceId={componentId}
            hasRightElement={false}
            readonly
          >
            <FormSingleRecordFieldChip
              draftValue={draftValue}
              selectedRecord={selectedRecord}
              objectNameSingular={objectNameSingulars[0]}
              onRemove={handleUnlinkVariable}
              disabled={disabled}
            />
          </StyledFormSelectContainer>
        ) : (
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponentWidth="100%"
            onClose={handleCloseRelationPickerDropdown}
            onOpen={handleOpenDropdown}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
            clickableComponent={
              <StyledFormSelectContainer
                formFieldInputInstanceId={componentId}
                hasRightElement={isDefined(VariablePicker) && !disabled}
                preventFocusStackUpdate={true}
              >
                <FormSingleRecordFieldChip
                  draftValue={draftValue}
                  selectedRecord={selectedRecord}
                  objectNameSingular={objectNameSingulars[0]}
                  onRemove={handleUnlinkVariable}
                  disabled={disabled}
                />
                <StyledIconButton>
                  <IconChevronDown
                    size={theme.icon.size.md}
                    color={theme.font.color.light}
                  />
                </StyledIconButton>
              </StyledFormSelectContainer>
            }
            dropdownComponents={
              <SingleRecordPicker
                focusId={dropdownId}
                componentInstanceId={dropdownId}
                EmptyIcon={IconForbid}
                emptyLabel={t`No ${objectNames}`}
                onCancel={() => closeDropdown(dropdownId)}
                onMorphItemSelected={handleMorphItemSelected}
                objectNameSingulars={objectNameSingulars}
                recordPickerInstanceId={dropdownId}
                dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
              />
            }
          />
        )}
        {isDefined(VariablePicker) && !disabled && (
          <VariablePicker
            instanceId={variablesDropdownId}
            disabled={disabled}
            onVariableSelect={handleVariableTagInsert}
            shouldDisplayRecordObjects={true}
            shouldDisplayRecordFields={false}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
