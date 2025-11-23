import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNumber } from '@sniptt/guards';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
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
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowFindRecordsFilters } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFilters';
import { WorkflowFindRecordsFiltersEffect } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFiltersEffect';
import { WorkflowFindRecordsSorts } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsSorts';
import { WorkflowObjectDropdown } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowObjectDropdown';

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledRecordTypeSelectContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const DEFAULT_SELECTED_OPTION = { label: 'Select an option', value: '' };

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

  const activeStandardObjectOptions = useMemo(
    () =>
      objectMetadataItems
        .filter(
          (objectMetadataItem) =>
            objectMetadataItem.isActive && !objectMetadataItem.isSystem,
        )
        .map((objectMetadataItem) => ({
          Icon: getIcon(objectMetadataItem.icon),
          label: objectMetadataItem.labelPlural,
          value: objectMetadataItem.nameSingular,
        })),
    [objectMetadataItems, getIcon],
  );

  const activeSystemObjectOptions = useMemo(
    () =>
      objectMetadataItems
        .filter(
          (objectMetadataItem) =>
            objectMetadataItem.isActive && objectMetadataItem.isSystem,
        )
        .map((objectMetadataItem) => ({
          Icon: getIcon(objectMetadataItem.icon),
          label: objectMetadataItem.labelPlural,
          value: objectMetadataItem.nameSingular,
        })),
    [objectMetadataItems, getIcon],
  );

  const selectedOption = useMemo(
    () =>
      [...activeStandardObjectOptions, ...activeSystemObjectOptions].find(
        (option) => option.value === action.settings.input.objectName,
      ) || DEFAULT_SELECTED_OPTION,
    [
      activeStandardObjectOptions,
      activeSystemObjectOptions,
      action.settings.input.objectName,
    ],
  );

  const filteredStandardObjectOptions = useMemo(
    () =>
      activeStandardObjectOptions.filter((option) =>
        option.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      ),
    [activeStandardObjectOptions, searchInputValue],
  );

  const filteredSystemObjectOptions = useMemo(
    () =>
      activeSystemObjectOptions.filter((option) =>
        option.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      ),
    [activeSystemObjectOptions, searchInputValue],
  );

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
  const [limitError, setLimitError] = useState<string | undefined>(undefined);
  const isFormDisabled = actionOptions.readonly ?? false;
  const instanceId = `workflow-edit-action-record-find-records-${action.id}-${formData.objectNameSingular}`;

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === formData.objectNameSingular,
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
            orderBy: updatedOrderBy as Record<string, any[]> | undefined,
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
    if (actionOptions.readonly === true) {
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

  return (
    <>
      <WorkflowStepBody>
        <StyledRecordTypeSelectContainer fullWidth>
          <StyledLabel>Object</StyledLabel>
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponent={
              <SelectControl
                isDisabled={isFormDisabled}
                selectedOption={selectedOption}
              />
            }
            dropdownComponents={
              !isFormDisabled && (
                <WorkflowObjectDropdown
                  isSystemObjectsView={isSystemObjectsOpen}
                  searchInputValue={searchInputValue}
                  filteredOptions={
                    isSystemObjectsOpen
                      ? filteredSystemObjectOptions
                      : filteredStandardObjectOptions
                  }
                  onSearchInputChange={handleSearchInputChange}
                  onOptionClick={handleOptionClick}
                  onBack={isSystemObjectsOpen ? handleBack : undefined}
                  onAdvancedClick={
                    !isSystemObjectsOpen ? handleSystemObjectsClick : undefined
                  }
                  showAdvancedOption={!isSystemObjectsOpen}
                />
              )
            }
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          />
        </StyledRecordTypeSelectContainer>

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
