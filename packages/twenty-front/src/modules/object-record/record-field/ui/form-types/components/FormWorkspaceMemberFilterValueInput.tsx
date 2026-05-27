import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  type ChangeEvent,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  arrayOfUuidOrVariableSchema,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { IconChevronDown, IconUserCircle } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type JsonValue } from 'type-fest';

import { MAX_WORKSPACE_MEMBERS_TO_DISPLAY } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownActorSelect';
import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

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

const StyledTriggerLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  margin: ${themeCssVariables.spacing[2]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPlaceholderContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]};
`;

type ParsedWorkspaceMemberFilterValue = {
  isCurrentWorkspaceMemberSelected: boolean;
  selectedRecordIds: string[];
};

const parseWorkspaceMemberFilterValue = (
  rawValue: string | null | undefined,
): ParsedWorkspaceMemberFilterValue => {
  if (!isDefined(rawValue) || rawValue === '') {
    return {
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: [],
    };
  }

  const fallbackRecordIds = (() => {
    try {
      return arrayOfUuidOrVariableSchema.parse(rawValue);
    } catch {
      return [] as string[];
    }
  })();

  const parsed = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: fallbackRecordIds,
    })
    .parse(rawValue);

  return {
    isCurrentWorkspaceMemberSelected:
      parsed.isCurrentWorkspaceMemberSelected ?? false,
    selectedRecordIds: parsed.selectedRecordIds,
  };
};

const buildJsonValue = ({
  isCurrentWorkspaceMemberSelected,
  selectedRecordIds,
}: ParsedWorkspaceMemberFilterValue): string => {
  if (!isCurrentWorkspaceMemberSelected && selectedRecordIds.length === 0) {
    return '';
  }

  return JSON.stringify({
    isCurrentWorkspaceMemberSelected,
    selectedRecordIds,
  });
};

export type FormWorkspaceMemberFilterValueInputProps = {
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
  const { theme } = useContext(ThemeContext);

  const componentId = useId();
  const dropdownId = `form-workspace-member-filter-picker-${componentId}`;
  const selectableListId = `${dropdownId}-selectable-list`;
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
      const jsonValue = buildJsonValue(next);

      if (jsonValue === '' && onClear) {
        onClear();
        return;
      }

      onChange(jsonValue);
    },
    [onChange, onClear],
  );

  const meSelectableItem: SelectableItem = useMemo(
    () => ({
      id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
      name: t`Me`,
      isSelected: isCurrentWorkspaceMemberSelected,
      AvatarIcon: IconUserCircle,
    }),
    [isCurrentWorkspaceMemberSelected],
  );

  const filteredPinnedSelectableItems = useMemo(
    () =>
      [meSelectableItem].filter((item) =>
        item.name.toLowerCase().includes(searchFilter.toLowerCase()),
      ),
    [meSelectableItem, searchFilter],
  );

  const handleSelectChange = useCallback(
    (itemToSelect: SelectableItem, isNewSelectedValue: boolean) => {
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

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(event.target.value);
    },
    [],
  );

  const handleDropdownClose = useCallback(() => {
    setSearchFilter('');
  }, []);

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

    const selectedPinnedItemNames = isCurrentWorkspaceMemberSelected
      ? [t`Me`]
      : [];

    const selectedItemNames = [
      ...selectedPinnedItemNames,
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

  const triggerContent = isVariableValue ? (
    <VariableChipStandalone
      rawVariableName={defaultValue ?? ''}
      onRemove={readonly ? undefined : handleUnlinkVariable}
    />
  ) : isDefined(triggerDisplayText) ? (
    <StyledTriggerLabel>
      {isCurrentWorkspaceMemberSelected && <IconUserCircle size={12} />}
      {triggerDisplayText}
    </StyledTriggerLabel>
  ) : (
    <StyledPlaceholderContainer>
      <FormFieldPlaceholder>{t`Select`}</FormFieldPlaceholder>
    </StyledPlaceholderContainer>
  );

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
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
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponentWidth="100%"
            onClose={handleDropdownClose}
            dropdownOffset={{
              y: parseInt(theme.spacing[1], 10),
            }}
            clickableComponent={
              <StyledFormSelectContainerWrapper>
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
              </StyledFormSelectContainerWrapper>
            }
            dropdownComponents={
              <DropdownContent
                widthInPixels={GenericDropdownContentWidth.ExtraLarge}
              >
                <DropdownMenuSearchInput
                  autoFocus
                  type="text"
                  value={searchFilter}
                  onChange={handleSearchChange}
                />
                <DropdownMenuSeparator />
                {filteredPinnedSelectableItems.length > 0 && (
                  <>
                    <ObjectFilterDropdownRecordPinnedItems
                      selectableItems={filteredPinnedSelectableItems}
                      onChange={handleSelectChange}
                    />
                    <DropdownMenuSeparator />
                  </>
                )}
                <MultipleSelectDropdown
                  selectableListId={selectableListId}
                  focusId={dropdownId}
                  itemsToSelect={recordsToSelect}
                  filteredSelectedItems={filteredSelectedRecords}
                  selectedItems={selectedRecords}
                  onChange={handleSelectChange}
                  searchFilter={searchFilter}
                  loadingItems={loading}
                />
              </DropdownContent>
            }
          />
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
