import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { FormSingleRecordFieldChip } from '@/object-record/record-field/form-types/components/FormSingleRecordFieldChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconChevronDown, IconForbid } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledFormSelectContainer = styled(FormFieldInputInnerContainer)`
  justify-content: space-between;
  align-items: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
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
  defaultValue: RecordId | Variable;
  onChange: (value: RecordId | Variable) => void;
  objectNameSingular: string;
  disabled?: boolean;
  testId?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormSingleRecordPicker = ({
  label,
  defaultValue,
  objectNameSingular,
  onChange,
  disabled,
  testId,
  VariablePicker,
}: FormSingleRecordPickerProps) => {
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

  const { record: selectedRecord } = useFindOneRecord({
    objectRecordId:
      isDefined(defaultValue) && !isStandaloneVariableString(defaultValue)
        ? defaultValue
        : '',
    objectNameSingular,
    withSoftDeleted: true,
    skip: !isValidUuid(defaultValue),
  });

  const dropdownId = `form-record-picker-${objectNameSingular}`;
  const variablesDropdownId = `form-record-picker-${objectNameSingular}-variables`;

  const { closeDropdown } = useDropdown(dropdownId);

  const setRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRecordPickerSearchFilter('');
  }, [setRecordPickerSearchFilter]);

  const handleRecordSelected = (
    selectedEntity: SingleRecordPickerRecord | null | undefined,
  ) => {
    onChange?.(selectedEntity?.record?.id ?? '');
    closeDropdown();
  };

  const handleVariableTagInsert = (variable: string) => {
    onChange?.(variable);
    closeDropdown();
  };

  const handleUnlinkVariable = () => {
    closeDropdown();

    onChange('');
  };

  const setRecordPickerSelectedId = useSetRecoilComponentStateV2(
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

  return (
    <FormFieldInputContainer testId={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormFieldInputRowContainer>
        <StyledFormSelectContainer
          hasRightElement={isDefined(VariablePicker) && !disabled}
          preventSetHotkeyScope={true}
        >
          <FormSingleRecordFieldChip
            draftValue={draftValue}
            selectedRecord={selectedRecord}
            objectNameSingular={objectNameSingular}
            onRemove={handleUnlinkVariable}
            disabled={disabled}
          />
          {!disabled && (
            <DropdownScope dropdownScopeId={dropdownId}>
              <Dropdown
                dropdownId={dropdownId}
                dropdownPlacement="left-start"
                onClose={handleCloseRelationPickerDropdown}
                onOpen={handleOpenDropdown}
                clickableComponent={
                  <LightIconButton
                    className="displayOnHover"
                    Icon={IconChevronDown}
                    accent="tertiary"
                  />
                }
                dropdownComponents={
                  <SingleRecordPicker
                    componentInstanceId={dropdownId}
                    EmptyIcon={IconForbid}
                    emptyLabel={'No ' + objectNameSingular}
                    onCancel={() => closeDropdown()}
                    onRecordSelected={handleRecordSelected}
                    objectNameSingular={objectNameSingular}
                    recordPickerInstanceId={dropdownId}
                  />
                }
                dropdownHotkeyScope={{ scope: dropdownId }}
              />
            </DropdownScope>
          )}
        </StyledFormSelectContainer>
        {isDefined(VariablePicker) && !disabled && (
          <VariablePicker
            inputId={variablesDropdownId}
            disabled={disabled}
            onVariableSelect={handleVariableTagInsert}
            objectNameSingularToSelect={objectNameSingular}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
