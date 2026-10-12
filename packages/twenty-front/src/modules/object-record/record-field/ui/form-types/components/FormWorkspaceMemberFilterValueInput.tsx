import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useId, useMemo, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { MAX_WORKSPACE_MEMBERS_TO_DISPLAY } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownActorSelect';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormWorkspaceMemberFilterValueInputDropdownContent } from '@/object-record/record-field/ui/form-types/components/FormWorkspaceMemberFilterValueInputDropdownContent';
import { FormWorkspaceMemberFilterValueInputTrigger } from '@/object-record/record-field/ui/form-types/components/FormWorkspaceMemberFilterValueInputTrigger';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import {
  buildWorkspaceMemberFilterJsonValue,
  type ParsedWorkspaceMemberFilterValue,
  parseWorkspaceMemberFilterValue,
} from '@/object-record/record-field/ui/form-types/utils/parseWorkspaceMemberFilterValue';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { Field } from 'twenty-ui/primitives/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isStandaloneVariableString } from 'twenty-shared/workflow';

const StyledFormSelectContainerWrapper = styled.div<{ readonly?: boolean }>`
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  width: 100%;
`;

const StyledIconButton = styled.div`
  display: flex;
  padding-right: ${themeCssVariables.spacing[2]};
`;

type FormWorkspaceMemberFilterValueInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: JsonValue) => void;
  onClear?: () => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
};

export const FormWorkspaceMemberFilterValueInput = ({
  label,
  defaultValue,
  onChange,
  onClear,
  readonly,
  VariablePicker,
}: FormWorkspaceMemberFilterValueInputProps) => {
  const theme = useTheme();

  const componentId = useId();
  const dropdownId = `form-workspace-member-filter-picker-${componentId}`;
  const variablesDropdownId = `${dropdownId}-variables`;

  const [searchFilter, setSearchFilter] = useState('');

  const isVariableValue = isStandaloneVariableString(defaultValue);

  const parsedValue = useMemo(
    () =>
      isVariableValue
        ? {
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: [] as string[],
          }
        : parseWorkspaceMemberFilterValue(defaultValue),
    [defaultValue, isVariableValue],
  );

  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } = parsedValue;

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: searchFilter,
      selectedIds: selectedRecordIds,
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      limit: 10,
      allowRequestsToTwentyIcons: false,
    });

  const emitChange = useCallback(
    (next: ParsedWorkspaceMemberFilterValue) => {
      const jsonValue = buildWorkspaceMemberFilterJsonValue(next);

      if (jsonValue === '' && onClear) {
        onClear();
        return;
      }

      onChange(jsonValue);
    },
    [onChange, onClear],
  );

  const handleSelectChange = useCallback(
    ({
      itemToSelect,
      isNewSelectedValue,
    }: {
      itemToSelect: Pick<SelectableItem, 'id'>;
      isNewSelectedValue: boolean;
    }) => {
      if (loading) {
        return;
      }

      const isItemCurrentWorkspaceMember =
        itemToSelect.id === CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID;

      const nextIsCurrentWorkspaceMemberSelected = isItemCurrentWorkspaceMember
        ? isNewSelectedValue
        : isCurrentWorkspaceMemberSelected;

      const nextSelectedRecordIds = isItemCurrentWorkspaceMember
        ? selectedRecordIds
        : isNewSelectedValue
          ? [...selectedRecordIds, itemToSelect.id]
          : selectedRecordIds.filter((id) => id !== itemToSelect.id);

      emitChange({
        isCurrentWorkspaceMemberSelected: nextIsCurrentWorkspaceMemberSelected,
        selectedRecordIds: nextSelectedRecordIds,
      });
    },
    [emitChange, isCurrentWorkspaceMemberSelected, loading, selectedRecordIds],
  );

  const handleVariableTagInsert = useCallback(
    (variable: string) => {
      onChange(variable);
    },
    [onChange],
  );

  const handleUnlinkVariable = useCallback(() => {
    if (isDefined(onClear)) {
      onClear();
      return;
    }

    onChange('');
  }, [onChange, onClear]);

  const triggerDisplayText = useMemo(() => {
    const selectedRecordNames = [
      ...recordsToSelect,
      ...selectedRecords,
      ...filteredSelectedRecords,
    ]
      .filter(
        (record, index, self) =>
          self.findIndex((other) => other.id === record.id) === index,
      )
      .filter((record) => selectedRecordIds.includes(record.id))
      .map((record) => record.name);

    const selectedCurrentMemberNames = isCurrentWorkspaceMemberSelected
      ? [t`Me`]
      : [];

    const selectedItemNames = [
      ...selectedCurrentMemberNames,
      ...selectedRecordNames,
    ];

    if (selectedItemNames.length === 0) {
      return null;
    }

    if (selectedItemNames.length > MAX_WORKSPACE_MEMBERS_TO_DISPLAY) {
      return t`${selectedItemNames.length} workspace members`;
    }

    return selectedItemNames.join(', ');
  }, [
    filteredSelectedRecords,
    isCurrentWorkspaceMemberSelected,
    recordsToSelect,
    selectedRecordIds,
    selectedRecords,
  ]);

  const triggerContent = (
    <FormWorkspaceMemberFilterValueInputTrigger
      isVariableValue={isVariableValue}
      defaultValue={defaultValue}
      isCurrentWorkspaceMemberSelected={isCurrentWorkspaceMemberSelected}
      triggerDisplayText={triggerDisplayText}
      readonly={readonly}
      onUnlinkVariable={handleUnlinkVariable}
    />
  );

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormFieldInputRowContainer>
        {readonly ? (
          <StyledFormSelectContainerWrapper readonly>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              {triggerContent}
            </FormFieldInputInnerContainer>
          </StyledFormSelectContainerWrapper>
        ) : (
          <DropdownRoot
            dropdownId={dropdownId}
            type="picker"
            multiple
            onOpenChange={(open) => {
              if (!open) {
                setSearchFilter('');
              }
            }}
          >
            <Dropdown.Trigger
              render={<StyledFormSelectContainerWrapper />}
              nativeButton={false}
            >
              <FormFieldInputInnerContainer
                formFieldInputInstanceId={componentId}
                hasRightElement={isDefined(VariablePicker)}
                hoverable
                preventFocusStackUpdate
              >
                {triggerContent}
                <StyledIconButton>
                  <IconChevronDown
                    size={theme.icon.size.md}
                    color={theme.font.color.light}
                  />
                </StyledIconButton>
              </FormFieldInputInnerContainer>
            </Dropdown.Trigger>
            <DropdownContent
              aria-label={t`Select workspace members`}
              side="bottom"
              align="start"
              sideOffset={parseInt(theme.spacing[1], 10)}
              width={GenericDropdownContentWidth.ExtraLarge}
            >
              <FormWorkspaceMemberFilterValueInputDropdownContent
                searchFilter={searchFilter}
                onSearchChange={setSearchFilter}
                isCurrentWorkspaceMemberSelected={
                  isCurrentWorkspaceMemberSelected
                }
                recordsToSelect={recordsToSelect}
                filteredSelectedRecords={filteredSelectedRecords}
                loading={loading}
                onSelectChange={handleSelectChange}
              />
            </DropdownContent>
          </DropdownRoot>
        )}
        {isDefined(VariablePicker) && !readonly && (
          <VariablePicker
            instanceId={variablesDropdownId}
            disabled={readonly}
            onVariableSelect={handleVariableTagInsert}
            shouldDisplayRecordObjects={true}
            shouldDisplayRecordFields={false}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
