import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isNumber } from '@sniptt/guards';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowFindRecordsFilters } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFilters';
import { WorkflowFindRecordsFiltersEffect } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFiltersEffect';
import { WorkflowFindRecordsSorts } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsSorts';
import { type WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  HorizontalSeparator,
  IconChevronLeft,
  IconSettings,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowEditActionFindRecordsProps = {
  action: WorkflowFindRecordsAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowFindRecordsAction) => void;
      };
};

type FindRecordsFormData = {
  objectNameSingular: string;
  filter?: FindRecordsActionFilter;
  orderBy?: FindRecordsActionOrderBy;
  limit?: number;
};

export type FindRecordsActionFilter = {
  recordFilterGroups?: RecordFilterGroup[];
  recordFilters?: RecordFilter[];
  gqlOperationFilter?: JsonValue;
};

export type FindRecordsActionOrderBy = {
  recordSorts?: RecordSort[];
  gqlOperationOrderBy?: JsonValue;
};

const StyledSelectContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const filterOptionsBySearch = <T extends { label: string }>(
  options: T[],
  searchValue: string,
): T[] => {
  if (!searchValue) return options;
  return options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );
};

export const WorkflowEditActionFindRecords = ({
  action,
  actionOptions,
}: WorkflowEditActionFindRecordsProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const maxRecordsFormatted = QUERY_MAX_RECORDS.toLocaleString();

  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSystemObjectsOpen, setIsSystemObjectsOpen] = useState(false);
  const dropdownId = 'workflow-edit-action-record-find-records-object-name';

  const { closeDropdown } = useCloseDropdown();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const regularObjects = objectMetadataItems
    .filter(
      (objectMetadataItem) =>
        objectMetadataItem.isActive && !objectMetadataItem.isSystem,
    )
    .map((objectMetadataItem) => ({
      label: objectMetadataItem.labelPlural,
      value: objectMetadataItem.nameSingular,
      Icon: getIcon(objectMetadataItem.icon),
    }));

  const systemObjects = objectMetadataItems
    .filter(
      (objectMetadataItem) =>
        objectMetadataItem.isActive && objectMetadataItem.isSystem,
    )
    .map((objectMetadataItem) => ({
      label: objectMetadataItem.labelPlural,
      value: objectMetadataItem.nameSingular,
      Icon: getIcon(objectMetadataItem.icon),
    }));

  const [formData, setFormData] = useState<FindRecordsFormData>(() => ({
    objectNameSingular: action.settings.input.objectName,
    limit:
      isNumber(action.settings.input.limit) &&
      action.settings.input.limit > QUERY_MAX_RECORDS
        ? QUERY_MAX_RECORDS
        : (action.settings.input.limit ?? 1),
    filter: action.settings.input.filter as FindRecordsActionFilter,
    orderBy: action.settings.input.orderBy as FindRecordsActionOrderBy,
  }));

  const filteredRegularObjects = useMemo(
    () =>
      filterOptionsBySearch(
        searchInputValue
          ? [...regularObjects, ...systemObjects]
          : regularObjects,
        searchInputValue,
      ),
    [regularObjects, systemObjects, searchInputValue],
  );

  const filteredSystemObjects = useMemo(
    () => filterOptionsBySearch(systemObjects, searchInputValue),
    [systemObjects, searchInputValue],
  );

  const [limitError, setLimitError] = useState<string | undefined>(undefined);
  const isFormDisabled = actionOptions.readonly ?? false;
  const instanceId = `workflow-edit-action-record-find-records-${action.id}-${formData.objectNameSingular}`;

  const selectedOption =
    [...regularObjects, ...systemObjects].find(
      (option) => option.value === formData.objectNameSingular,
    ) || regularObjects[0];

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === formData.objectNameSingular,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    recordFieldByFieldMetadataItemId,
  } = useRecordIndexFieldMetadataDerivedStates(
    selectedObjectMetadataItem,
    instanceId,
  );

  const saveAction = useDebouncedCallback(
    async (formData: FindRecordsFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectNameSingular: updatedObjectName,
        limit: updatedLimit,
        filter: updatedFilter,
        orderBy: updatedOrderBy,
      } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            limit: updatedLimit ?? 1,
            filter: updatedFilter,
            orderBy: updatedOrderBy as Record<string, JsonValue[]> | undefined,
          },
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleOptionClick = (value: string) => {
    if (isFormDisabled) {
      return;
    }

    const newFormData: FindRecordsFormData = {
      objectNameSingular: value,
      limit: 1,
    };

    setFormData(newFormData);
    saveAction(newFormData);
    closeDropdown(dropdownId);
  };

  const handleSystemObjectsClick = () => {
    setIsSystemObjectsOpen(true);
    setSearchInputValue('');
  };

  const handleBack = () => {
    setIsSystemObjectsOpen(false);
    setSearchInputValue('');
  };

  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInputValue(event.target.value);
    },
    [],
  );

  const selectableItemIdArray = useMemo(() => {
    if (isSystemObjectsOpen) {
      return filteredSystemObjects.map((option) => option.label);
    }
    return filteredRegularObjects.map((option) => option.label);
  }, [isSystemObjectsOpen, filteredSystemObjects, filteredRegularObjects]);

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { setSelectedItemId } = useSelectableList(dropdownId);

  const handleDropdownOpen = () => {
    if (isDefined(selectedOption) && !searchInputValue) {
      setSelectedItemId(selectedOption.label);
    }
  };

  return (
    <>
      <WorkflowStepBody>
        <StyledSelectContainer fullWidth>
          <InputLabel>Object</InputLabel>
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            onOpen={handleDropdownOpen}
            clickableComponent={
              <SelectControl
                isDisabled={isFormDisabled}
                selectedOption={selectedOption}
              />
            }
            dropdownComponents={
              <>
                {!isFormDisabled &&
                  (isSystemObjectsOpen ? (
                    <DropdownContent
                      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
                    >
                      <DropdownMenuHeader
                        StartComponent={
                          <DropdownMenuHeaderLeftComponent
                            onClick={handleBack}
                            Icon={IconChevronLeft}
                          />
                        }
                      >
                        <Trans>Advanced</Trans>
                      </DropdownMenuHeader>
                      <DropdownMenuSearchInput
                        autoFocus
                        value={searchInputValue}
                        onChange={handleSearchInputChange}
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItemsContainer hasMaxHeight>
                        <SelectableList
                          selectableListInstanceId={dropdownId}
                          focusId={dropdownId}
                          selectableItemIdArray={selectableItemIdArray}
                        >
                          {filteredSystemObjects.map((option) => (
                            <SelectableListItem
                              key={option.value}
                              itemId={option.label}
                              onEnter={() => handleOptionClick(option.value)}
                            >
                              <MenuItemSelect
                                LeftIcon={option.Icon}
                                text={option.label}
                                selected={selectedOption.value === option.value}
                                focused={selectedItemId === option.label}
                                onClick={() => handleOptionClick(option.value)}
                              />
                            </SelectableListItem>
                          ))}
                        </SelectableList>
                      </DropdownMenuItemsContainer>
                    </DropdownContent>
                  ) : (
                    <DropdownContent
                      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
                    >
                      <DropdownMenuSearchInput
                        autoFocus
                        value={searchInputValue}
                        onChange={handleSearchInputChange}
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItemsContainer hasMaxHeight>
                        <SelectableList
                          selectableListInstanceId={dropdownId}
                          focusId={dropdownId}
                          selectableItemIdArray={selectableItemIdArray}
                        >
                          {filteredRegularObjects.map((option) => (
                            <SelectableListItem
                              key={option.value}
                              itemId={option.label}
                              onEnter={() => handleOptionClick(option.value)}
                            >
                              <MenuItemSelect
                                LeftIcon={option.Icon}
                                text={option.label}
                                selected={selectedOption.value === option.value}
                                focused={selectedItemId === option.label}
                                onClick={() => handleOptionClick(option.value)}
                              />
                            </SelectableListItem>
                          ))}
                        </SelectableList>
                        {(!searchInputValue ||
                          'advanced'.includes(
                            searchInputValue.toLowerCase(),
                          )) && (
                          <MenuItem
                            text="Advanced"
                            LeftIcon={IconSettings}
                            onClick={handleSystemObjectsClick}
                            hasSubMenu
                          />
                        )}
                      </DropdownMenuItemsContainer>
                    </DropdownContent>
                  ))}
              </>
            }
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          />
        </StyledSelectContainer>

        <HorizontalSeparator noMargin />
        {isDefined(selectedObjectMetadataItem) && (
          <div>
            <InputLabel>{t`Filter`}</InputLabel>
            <RecordIndexContextProvider
              value={{
                indexIdentifierUrl: () => '',
                onIndexRecordsLoaded: () => {},
                objectNamePlural: selectedObjectMetadataItem.labelPlural,
                objectNameSingular: selectedObjectMetadataItem.nameSingular,
                objectMetadataItem: selectedObjectMetadataItem,
                recordIndexId: instanceId,
                viewBarInstanceId: instanceId,
                objectPermissionsByObjectMetadataId,
                labelIdentifierFieldMetadataItem,
                recordFieldByFieldMetadataItemId,
                fieldDefinitionByFieldMetadataItemId,
                fieldMetadataItemByFieldMetadataItemId,
              }}
            >
              <RecordFilterGroupsComponentInstanceContext.Provider
                value={{ instanceId }}
              >
                <RecordFiltersComponentInstanceContext.Provider
                  value={{ instanceId }}
                >
                  <WorkflowFindRecordsFilters
                    objectMetadataItem={selectedObjectMetadataItem}
                    onChange={(filter: FindRecordsActionFilter) => {
                      if (isFormDisabled === true) {
                        return;
                      }

                      const newFormData: FindRecordsFormData = {
                        ...formData,
                        filter,
                      };

                      setFormData(newFormData);

                      saveAction(newFormData);
                    }}
                    readonly={isFormDisabled}
                  />
                  <WorkflowFindRecordsFiltersEffect
                    defaultValue={formData.filter}
                  />
                </RecordFiltersComponentInstanceContext.Provider>
              </RecordFilterGroupsComponentInstanceContext.Provider>
            </RecordIndexContextProvider>
          </div>
        )}

        {isDefined(selectedObjectMetadataItem) && (
          <>
            <div>
              <InputLabel>{t`Sort`}</InputLabel>
              <WorkflowFindRecordsSorts
                recordSorts={formData.orderBy?.recordSorts ?? []}
                objectMetadataItem={selectedObjectMetadataItem}
                onChange={(sorts: RecordSort[]) => {
                  if (isFormDisabled === true) {
                    return;
                  }

                  const gqlOperationOrderBy =
                    sorts.length > 0
                      ? turnSortsIntoOrderBy(selectedObjectMetadataItem, sorts)
                      : undefined;

                  const newFormData: FindRecordsFormData = {
                    ...formData,
                    orderBy: {
                      recordSorts: sorts,
                      gqlOperationOrderBy,
                    },
                  };

                  setFormData(newFormData);

                  saveAction(newFormData);
                }}
                readonly={isFormDisabled}
              />
            </div>
          </>
        )}

        <FormNumberFieldInput
          label={t`Limit`}
          defaultValue={formData.limit}
          placeholder={t`Enter limit`}
          readonly={isFormDisabled}
          hint={t`This action can return up to ${maxRecordsFormatted} records.`}
          error={limitError}
          onChange={(limit) => {
            if (isFormDisabled === true || !isNumber(limit)) {
              return;
            }

            const normalizedLimit = Math.floor(limit);

            if (normalizedLimit <= 0) {
              setLimitError(t`Limit must be greater than 0.`);
              return;
            }

            const cappedLimit = Math.min(normalizedLimit, QUERY_MAX_RECORDS);

            setLimitError(
              normalizedLimit > QUERY_MAX_RECORDS
                ? t`Limit cannot exceed ${maxRecordsFormatted} records.`
                : undefined,
            );

            const newFormData: FindRecordsFormData = {
              ...formData,
              limit: cappedLimit,
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
