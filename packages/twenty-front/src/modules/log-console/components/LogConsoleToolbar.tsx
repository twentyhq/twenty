import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { MAX_OPTIONS_TO_DISPLAY } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconButton, LightButton } from 'twenty-ui/components';
import {
  type IconComponent,
  IconChevronLeft,
  IconDotsVertical,
  IconFilter,
  IconX,
} from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';
import { type LogConsoleFilterOption } from '@/log-console/types/LogConsoleFilterOption';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import {
  getOperandLabel,
  getOperandLabelShort,
} from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { EventLogFilterOperand } from '~/generated-metadata/graphql';

const LOG_CONSOLE_MENU_DROPDOWN_ID = 'log-console-menu';

const LOG_CONSOLE_SEARCH_FOCUS_ID = 'log-console-search';

const FILTER_CHIPS_SCROLL_WRAPPER_ID = 'log-console-filter-chips';

const MAX_VALUES_PER_FILTER = 100;

const VIEW_FILTER_OPERAND_BY_EVENT_LOG_FILTER_OPERAND: Record<
  EventLogFilterOperand,
  ViewFilterOperand
> = {
  [EventLogFilterOperand.IS]: ViewFilterOperand.IS,
  [EventLogFilterOperand.IS_NOT]: ViewFilterOperand.IS_NOT,
};

const StyledContainer = styled.div`
  flex-shrink: 0;
  padding-bottom: ${themeCssVariables.spacing[5]};
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
`;

const StyledSearch = styled.div`
  flex-shrink: 0;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFilterChips = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
`;

const StyledChips = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type LogConsoleToolbarProps = {
  filterFields: LogConsoleFilterField[];
  filters: LogConsoleFilter[];
  onFiltersChange: (filters: LogConsoleFilter[]) => void;
  search: ReactNode;
  logsAction: { label: string; Icon: IconComponent; onClick: () => void };
  children: ReactNode;
};

export const LogConsoleToolbar = ({
  filterFields,
  filters,
  onFiltersChange,
  search,
  logsAction,
  children,
}: LogConsoleToolbarProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const applications = useAtomStateValue(applicationsSelector);
  const [selectedFilterFieldId, setSelectedFilterFieldId] = useState<
    string | null
  >(null);
  const [searchInput, setSearchInput] = useState('');
  const [isFilterSubmenuOpen, setIsFilterSubmenuOpen] = useState(false);

  const selectedFilterField = filterFields.find(
    (filterField) => filterField.id === selectedFilterFieldId,
  );

  const filterFieldsWithChip = filters.flatMap(
    (filter) =>
      filterFields.find(
        (filterField) => filterField.id === filter.filterFieldId,
      ) ?? [],
  );

  const getFilterOptions = (filterField: LogConsoleFilterField) =>
    filterField.getOptions({
      workspaceMembers: currentWorkspaceMembers,
      activeObjectMetadataItems,
      logicFunctions,
      applications,
    });

  const getFilter = (filterField: LogConsoleFilterField): LogConsoleFilter =>
    filters.find((filter) => filter.filterFieldId === filterField.id) ?? {
      filterFieldId: filterField.id,
      operand: EventLogFilterOperand.IS,
      values: [],
    };

  const getOperandOption = (operand: EventLogFilterOperand) => ({
    value: operand,
    label: getOperandLabel(
      VIEW_FILTER_OPERAND_BY_EVENT_LOG_FILTER_OPERAND[operand],
    ),
  });

  const isOptionSelected = (
    filter: LogConsoleFilter,
    option: LogConsoleFilterOption,
  ) => option.values.every((value) => filter.values.includes(value));

  const setFilter = (changedFilter: LogConsoleFilter) =>
    onFiltersChange(
      filters.some(
        (filter) => filter.filterFieldId === changedFilter.filterFieldId,
      )
        ? filters.map((filter) =>
            filter.filterFieldId === changedFilter.filterFieldId
              ? changedFilter
              : filter,
          )
        : [...filters, changedFilter],
    );

  const toggleOption = (
    filter: LogConsoleFilter,
    option: LogConsoleFilterOption,
  ) =>
    setFilter({
      ...filter,
      values: isOptionSelected(filter, option)
        ? filter.values.filter((value) => !option.values.includes(value))
        : [...filter.values, ...option.values],
    });

  const resetFilterDropdown = () => {
    setSearchInput('');
    setSelectedFilterFieldId(null);

    if (filters.some((filter) => !isNonEmptyArray(filter.values))) {
      onFiltersChange(
        filters.filter((filter) => isNonEmptyArray(filter.values)),
      );
    }
  };

  const resetMenu = () => {
    resetFilterDropdown();
    setIsFilterSubmenuOpen(false);
  };

  const getChipLabelValue = (
    filterField: LogConsoleFilterField,
    filter: LogConsoleFilter,
  ) => {
    const selectedOptionLabels = getFilterOptions(filterField)
      .filter((option) => isOptionSelected(filter, option))
      .map((option) => option.label);
    const selectedOptionCount = selectedOptionLabels.length;

    if (selectedOptionCount === 0) {
      return '';
    }

    const displayValue =
      selectedOptionCount > MAX_OPTIONS_TO_DISPLAY
        ? t`${selectedOptionCount} options`
        : selectedOptionLabels.join(', ');

    return `${getOperandLabelShort(VIEW_FILTER_OPERAND_BY_EVENT_LOG_FILTER_OPERAND[filter.operand])} ${displayValue}`;
  };

  const renderValuePicker = ({
    filterField,
    dropdownId,
    HeaderIcon,
    onHeaderClick,
  }: {
    filterField: LogConsoleFilterField;
    dropdownId: string;
    HeaderIcon: IconComponent;
    onHeaderClick: () => void;
  }) => {
    const filter = getFilter(filterField);
    const matchingOptions = getFilterOptions(filterField).filter((option) =>
      option.label.toLowerCase().includes(searchInput.toLowerCase()),
    );

    return (
      <LegacyDropdownContent
        widthInPixels={GenericDropdownContentWidth.ExtraLarge}
      >
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={onHeaderClick}
              Icon={HeaderIcon}
            />
          }
        >
          {t(filterField.label)}
        </DropdownMenuHeader>
        <DropdownMenuInnerSelect
          dropdownId={`${dropdownId}-operand`}
          selectedOption={getOperandOption(filter.operand)}
          options={Object.values(EventLogFilterOperand).map(getOperandOption)}
          onChange={(operandOption) =>
            setFilter({
              ...filter,
              operand:
                operandOption.value === EventLogFilterOperand.IS_NOT
                  ? EventLogFilterOperand.IS_NOT
                  : EventLogFilterOperand.IS,
            })
          }
          widthInPixels={GenericDropdownContentWidth.ExtraLarge}
        />
        <DropdownMenuSeparator />
        <DropdownMenuSearchInput
          value={searchInput}
          placeholder={t(filterField.label)}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer isMultiSelect hasMaxHeight>
          {isNonEmptyArray(matchingOptions) ? (
            matchingOptions.map((option) => {
              const isSelected = isOptionSelected(filter, option);

              return (
                <ListItem
                  key={option.values.join()}
                  role="option"
                  aria-selected={isSelected}
                  selected={isSelected}
                  indicator="checkbox"
                  disabled={
                    !isSelected &&
                    filter.values.length + option.values.length >
                      MAX_VALUES_PER_FILTER
                  }
                  startIcon={option.startIcon}
                  onClick={() => toggleOption(filter, option)}
                >
                  {option.tag ?? option.label}
                </ListItem>
              );
            })
          ) : (
            <ListItem disabled>{t`No results`}</ListItem>
          )}
        </DropdownMenuItemsContainer>
      </LegacyDropdownContent>
    );
  };

  const renderFieldList = () => {
    const matchingFilterFields = filterFields.filter((filterField) =>
      t(filterField.label).toLowerCase().includes(searchInput.toLowerCase()),
    );

    return (
      <LegacyDropdownContent
        widthInPixels={GenericDropdownContentWidth.ExtraLarge}
      >
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={resetMenu}
              Icon={IconChevronLeft}
            />
          }
        >
          {t`Filter`}
        </DropdownMenuHeader>
        <DropdownMenuSearchInput
          value={searchInput}
          placeholder={t`Search fields`}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer>
          {isNonEmptyArray(matchingFilterFields) ? (
            matchingFilterFields.map((filterField) => (
              <ListItem
                key={filterField.id}
                role="option"
                startIcon={<filterField.Icon />}
                onClick={() => {
                  setSearchInput('');
                  setSelectedFilterFieldId(filterField.id);
                }}
              >
                {t(filterField.label)}
              </ListItem>
            ))
          ) : (
            <ListItem disabled>{t`No results`}</ListItem>
          )}
        </DropdownMenuItemsContainer>
      </LegacyDropdownContent>
    );
  };

  const renderChip = (filterField: LogConsoleFilterField) => {
    const dropdownId = `log-console-filter-${filterField.id}`;

    return (
      <Dropdown
        key={filterField.id}
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        dropdownOffset={{ y: 8 }}
        onOpen={() => setSearchInput('')}
        onClose={resetFilterDropdown}
        clickableComponent={
          <SortOrFilterChip
            type="filter"
            Icon={filterField.Icon}
            labelKey={t(filterField.label)}
            labelValue={getChipLabelValue(filterField, getFilter(filterField))}
            testId={filterField.id}
            onRemove={() => {
              closeDropdown(dropdownId);
              onFiltersChange(
                filters.filter(
                  (filter) => filter.filterFieldId !== filterField.id,
                ),
              );
            }}
          />
        }
        dropdownComponents={renderValuePicker({
          filterField,
          dropdownId,
          HeaderIcon: IconX,
          onHeaderClick: () => closeDropdown(dropdownId),
        })}
      />
    );
  };

  const pushSearchFocusItem = () =>
    pushFocusItemToFocusStack({
      focusId: LOG_CONSOLE_SEARCH_FOCUS_ID,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: LOG_CONSOLE_SEARCH_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

  const removeSearchFocusItem = () =>
    removeFocusItemFromFocusStackById({
      focusId: LOG_CONSOLE_SEARCH_FOCUS_ID,
    });

  const runLogsAction = () => {
    closeDropdown(LOG_CONSOLE_MENU_DROPDOWN_ID);
    logsAction.onClick();
  };

  const renderMenu = () => {
    if (isDefined(selectedFilterField)) {
      return renderValuePicker({
        filterField: selectedFilterField,
        dropdownId: LOG_CONSOLE_MENU_DROPDOWN_ID,
        HeaderIcon: IconChevronLeft,
        onHeaderClick: resetFilterDropdown,
      });
    }

    if (isFilterSubmenuOpen) {
      return renderFieldList();
    }

    return (
      <LegacyDropdownContent>
        <DropdownMenuItemsContainer>
          <ListItem
            startIcon={<IconFilter />}
            hasSubmenu
            onClick={() => setIsFilterSubmenuOpen(true)}
          >
            {t`Filter`}
          </ListItem>
          <ListItem startIcon={<logsAction.Icon />} onClick={runLogsAction}>
            {logsAction.label}
          </ListItem>
        </DropdownMenuItemsContainer>
      </LegacyDropdownContent>
    );
  };

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledSearch
          onFocus={pushSearchFocusItem}
          onBlur={removeSearchFocusItem}
        >
          {search}
        </StyledSearch>
        {isNonEmptyArray(filterFieldsWithChip) && (
          <StyledFilterChips>
            <ScrollWrapper
              componentInstanceId={FILTER_CHIPS_SCROLL_WRAPPER_ID}
              defaultEnableYScroll={false}
            >
              <StyledChips>{filterFieldsWithChip.map(renderChip)}</StyledChips>
            </ScrollWrapper>
            <LightButton emphasis="subtle" onClick={() => onFiltersChange([])}>
              {t`Reset`}
            </LightButton>
          </StyledFilterChips>
        )}
        <StyledActions>
          {isNonEmptyArray(filterFields) ? (
            <Dropdown
              dropdownId={LOG_CONSOLE_MENU_DROPDOWN_ID}
              dropdownPlacement="bottom-end"
              dropdownOffset={{ y: 8 }}
              onOpen={() => setSearchInput('')}
              onClose={resetMenu}
              clickableComponent={
                <IconButton aria-label={t`More options`}>
                  <IconDotsVertical />
                </IconButton>
              }
              dropdownComponents={renderMenu()}
            />
          ) : (
            <IconButton
              tooltip={logsAction.label}
              aria-label={logsAction.label}
              onClick={logsAction.onClick}
            >
              <logsAction.Icon />
            </IconButton>
          )}
          {children}
        </StyledActions>
      </StyledToolbar>
    </StyledContainer>
  );
};
