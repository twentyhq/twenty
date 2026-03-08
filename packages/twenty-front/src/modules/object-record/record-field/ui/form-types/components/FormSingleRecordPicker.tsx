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
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useContext, useId } from 'react';
import { CustomError, isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconChevronDown, IconForbid } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFormSelectContainerWrapper = styled.div<{ readonly?: boolean }>`
  align-items: center;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  height: 32px;
  justify-content: space-between;

  padding-right: ${themeCssVariables.spacing[2]};

  &:hover,
  &[data-open='true'] {
    background-color: ${({ readonly }) =>
      readonly
        ? 'transparent'
        : themeCssVariables.background.transparent.light};
  }
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
  onClear?: () => void;
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
  onClear,
  disabled,
  testId,
  VariablePicker,
}: FormSingleRecordPickerProps) => {
  const { theme } = useContext(ThemeContext);

  const draftValue: FormSingleRecordPickerValue = isStandaloneVariableString(
    defaultValue,
  )
    ? {
        type: 'variable',
        value: defaultValue,
      }
    : {
        type: 'static',
        value: (defaultValue as string | undefined) ?? '',
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

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setSingleRecordPickerSearchFilter('');
  }, [setSingleRecordPickerSearchFilter]);

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (!isNonEmptyString(selectedMorphItem?.recordId)) {
      onClear?.();

      return;
    }

    onChange(selectedMorphItem.recordId);
    closeDropdown(dropdownId);
  };

  const handleVariableTagInsert = (variable: string) => {
    onChange?.(variable);
  };

  const handleUnlinkVariable = (event?: React.MouseEvent<HTMLDivElement>) => {
    event?.stopPropagation();
    onClear?.();
  };

  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleOpenDropdown = () => {
    if (
      isDefined(draftValue?.value) &&
      !isStandaloneVariableString(draftValue.value)
    ) {
      setSingleRecordPickerSelectedId(draftValue.value);
    }
  };

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormFieldInputRowContainer>
        {disabled ? (
          <StyledFormSelectContainerWrapper readonly>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              <FormSingleRecordFieldChip
                draftValue={draftValue}
                selectedRecord={selectedRecord}
                objectNameSingular={objectNameSingulars[0]}
                onRemove={handleUnlinkVariable}
                disabled={disabled}
              />
            </FormFieldInputInnerContainer>
          </StyledFormSelectContainerWrapper>
        ) : (
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponentWidth="100%"
            onClose={handleCloseRelationPickerDropdown}
            onOpen={handleOpenDropdown}
            dropdownOffset={{
              y: parseInt(theme.spacing[1], 10),
            }}
            clickableComponent={
              <StyledFormSelectContainerWrapper>
                <FormFieldInputInnerContainer
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
                </FormFieldInputInnerContainer>
              </StyledFormSelectContainerWrapper>
            }
            dropdownComponents={
              <SingleRecordPicker
                focusId={dropdownId}
                componentInstanceId={dropdownId}
                EmptyIcon={IconForbid}
                emptyLabel={t`No records`}
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
