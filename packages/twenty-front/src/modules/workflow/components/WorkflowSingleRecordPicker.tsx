import { IconChevronDown, IconForbid, LightIconButton } from 'twenty-ui';

import { RecordChip } from '@/object-record/components/RecordChip';
import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { SingleRecordSelect } from '@/object-record/relation-picker/components/SingleRecordSelect';
import { useRecordPicker } from '@/object-record/relation-picker/hooks/useRecordPicker';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useCallback, useState } from 'react';
import { isValidUuid } from '~/utils/isValidUuid';

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

// export const StyledInputContainer = styled.div`
//   background-color: ${({ theme }) => theme.background.transparent.lighter};
//   border: 1px solid ${({ theme }) => theme.border.color.medium};
//   border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
//   border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
//   border-right: none;
//   border-bottom-right-radius: none;
//   border-top-right-radius: none;
//   box-sizing: border-box;
//   display: flex;
//   overflow: 'hidden';
//   width: 100%;
//   justify-content: space-between;
//   align-items: center;
//   padding-left: ${({ theme }) => theme.spacing(2)};
//   padding-right: ${({ theme }) => theme.spacing(1)};
// `;

export const StyledRecordPickerDropdownContainer = styled.div``;

export const StyledSearchVariablesDropdownContainer = styled.div`
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

type RecordId = string;
type Variable = string;

export type WorkflowSingleRecordPickerProps = {
  label?: string;
  selectedRecord?: string | ObjectRecord;
  onPersist: (value: RecordId | Variable) => void;
  initialSearchFilter?: string | null;
  objectNameSingular: string;
};

const isValidRecordId = (value: string): boolean =>
  !!value && isValidUuid(value);

export const WorkflowSingleRecordPicker = ({
  label,
  selectedRecord,
  objectNameSingular,
  onPersist,
}: WorkflowSingleRecordPickerProps) => {
  const [draftValue, setDraftValue] = useState<string | ObjectRecord>(
    selectedRecord ?? '',
  );

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
    setDraftValue(selectedEntity?.record ?? '');
    closeDropdown();
  };

  const handleVariableTagInsert = (variable: string) => {
    setDraftValue(variable);

    onPersist?.(variable);
  };

  const Chip = isString(draftValue) ? (
    <VariableChip rawVariableName={draftValue} onRemove={() => {}} />
  ) : (
    <RecordChip record={draftValue} objectNameSingular={objectNameSingular} />
  );

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <StyledFormFieldInputRowContainer>
        <StyledFormFieldInputInputContainer hasRightElement>
          {draftValue ? (
            Chip
          ) : (
            <StyledPlaceholder>Select a {objectNameSingular}</StyledPlaceholder>
          )}
          <StyledRecordPickerDropdownContainer>
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
                        !isString(draftValue) && isValidRecordId(draftValue?.id)
                          ? [draftValue.id]
                          : []
                      }
                    />
                  </RecordPickerComponentInstanceContext.Provider>
                }
                dropdownHotkeyScope={{
                  scope: dropdownId,
                }}
              />
            </DropdownScope>
          </StyledRecordPickerDropdownContainer>
        </StyledFormFieldInputInputContainer>
        <StyledSearchVariablesDropdownContainer>
          <SearchVariablesDropdown
            inputId={variablesDropdownId}
            onVariableSelect={handleVariableTagInsert}
            disabled={false}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledFormFieldInputRowContainer>
    </StyledFormFieldInputContainer>
  );
};
