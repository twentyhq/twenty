import {
  IconChevronDown,
  IconForbid,
  isDefined,
  LightIconButton,
} from 'twenty-ui';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { SingleRecordSelect } from '@/object-record/relation-picker/components/SingleRecordSelect';
import { useRecordPicker } from '@/object-record/relation-picker/hooks/useRecordPicker';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { WorkflowSingleRecordFieldChip } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowSingleRecordFieldChip';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { isValidUuid } from '~/utils/isValidUuid';

const StyledFormSelectContainer = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-right: none;
  border-bottom-right-radius: none;
  border-top-right-radius: none;
  box-sizing: border-box;
  display: flex;
  overflow: 'hidden';
  width: 100%;
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
};

export const WorkflowSingleRecordPicker = ({
  label,
  defaultValue,
  objectNameSingular,
  onChange,
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

  const { setRecordPickerSearchFilter } = useRecordPicker({
    recordPickerInstanceId: dropdownId,
  });

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setRecordPickerSearchFilter('');
  }, [setRecordPickerSearchFilter]);

  const handleRecordSelected = (
    selectedEntity: RecordForSelect | null | undefined,
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

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormFieldInputRowContainer>
        <StyledFormSelectContainer>
          <WorkflowSingleRecordFieldChip
            draftValue={draftValue}
            selectedRecord={selectedRecord}
            objectNameSingular={objectNameSingular}
            onRemove={handleUnlinkVariable}
          />
          <DropdownScope dropdownScopeId={dropdownId}>
            <Dropdown
              dropdownId={dropdownId}
              dropdownPlacement="left-start"
              onClose={handleCloseRelationPickerDropdown}
              clickableComponent={
                <LightIconButton
                  className="displayOnHover"
                  Icon={IconChevronDown}
                  accent="tertiary"
                />
              }
              dropdownComponents={
                <RecordPickerComponentInstanceContext.Provider
                  value={{ instanceId: dropdownId }}
                >
                  <SingleRecordSelect
                    EmptyIcon={IconForbid}
                    emptyLabel={'No ' + objectNameSingular}
                    onCancel={() => closeDropdown()}
                    onRecordSelected={handleRecordSelected}
                    objectNameSingular={objectNameSingular}
                    recordPickerInstanceId={dropdownId}
                    selectedRecordIds={
                      draftValue?.value &&
                      !isStandaloneVariableString(draftValue.value)
                        ? [draftValue.value]
                        : []
                    }
                  />
                </RecordPickerComponentInstanceContext.Provider>
              }
              dropdownHotkeyScope={{ scope: dropdownId }}
            />
          </DropdownScope>
        </StyledFormSelectContainer>
        <StyledSearchVariablesDropdownContainer>
          <WorkflowVariablesDropdown
            inputId={variablesDropdownId}
            onVariableSelect={handleVariableTagInsert}
            disabled={false}
            objectNameSingularToSelect={objectNameSingular}
          />
        </StyledSearchVariablesDropdownContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
