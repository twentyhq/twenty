import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
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
import { WorkflowSingleRecordFieldChip } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowSingleRecordFieldChip';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared';
import { IconChevronDown, IconForbid, LightIconButton } from 'twenty-ui';

const StyledFormSelectContainer = styled(FormFieldInputInputContainer)`
  justify-content: space-between;
  align-items: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledSearchVariablesDropdownContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  ${({ theme }) => css`
    :hover {
      background-color: ${theme.background.transparent.light};
    }
  `}
  ${({ theme }) => css`
    background-color: ${theme.background.transparent.lighter};
    border-top-right-radius: ${theme.border.radius.sm};
    border-bottom-right-radius: ${theme.border.radius.sm};
    border: 1px solid ${theme.border.color.medium};
  `}
`;

export type RecordId = string;
export type Variable = string;

type WorkflowSingleRecordPickerValue =
  | {
      type: 'static';
      value: RecordId;
    }
  | {
      type: 'variable';
      value: Variable;
    };

export type WorkflowSingleRecordPickerProps = {
  label?: string;
  defaultValue: RecordId | Variable;
  onChange: (value: RecordId | Variable) => void;
  objectNameSingular: string;
  disabled?: boolean;
  testId?: string;
};

export const WorkflowSingleRecordPicker = ({
  label,
  defaultValue,
  objectNameSingular,
  onChange,
  disabled,
  testId,
}: WorkflowSingleRecordPickerProps) => {
  const draftValue: WorkflowSingleRecordPickerValue =
    isStandaloneVariableString(defaultValue)
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

  const dropdownId = `workflow-record-picker-${objectNameSingular}`;
  const variablesDropdownId = `workflow-record-picker-${objectNameSingular}-variables`;

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
        <StyledFormSelectContainer hasRightElement={!disabled}>
          <WorkflowSingleRecordFieldChip
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

        {!disabled && (
          <StyledSearchVariablesDropdownContainer>
            <WorkflowVariablesDropdown
              inputId={variablesDropdownId}
              onVariableSelect={handleVariableTagInsert}
              objectNameSingularToSelect={objectNameSingular}
            />
          </StyledSearchVariablesDropdownContainer>
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
