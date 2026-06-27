import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledRecordTypeSelectContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const filterOptionsBySearch = <T extends { label: string; value: string }>(
  options: T[],
  searchValue: string,
): T[] => {
  if (searchValue === '') return options;

  const searchValueLowerCase = searchValue.toLowerCase();

  return options.filter((option) =>
    [option.label, option.value].some((searchableValue) =>
      searchableValue.toLowerCase().includes(searchValueLowerCase),
    ),
  );
};

type WorkflowEditTriggerDatabaseEventFormProps = {
  trigger: WorkflowDatabaseEventTrigger;
  triggerOptions:
    | {
        readonly: true;
        onTriggerUpdate?: undefined;
      }
    | {
        readonly?: false;
        onTriggerUpdate: (trigger: WorkflowDatabaseEventTrigger) => void;
      };
};

export const WorkflowEditTriggerDatabaseEventForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerDatabaseEventFormProps) => {
  const { t } = useLingui();
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();
  const [searchInputValue, setSearchInputValue] = useState('');
  const dropdownId = 'workflow-edit-trigger-record-type';

  const { closeDropdown } = useCloseDropdown();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const triggerEvent = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );
  const isUpdateEvent = triggerEvent.event === 'updated';
  const isUpsertEvent = triggerEvent.event === 'upserted';
  const isFieldFilteringSupported = isUpdateEvent || isUpsertEvent;

  const defaultSelectedOption = useMemo<SelectOption<string>>(
    () => ({ label: t`Select an option`, value: '' }),
    [t],
  );

  const { regularObjects, systemObjects } = useMemo(() => {
    return objectMetadataItems.reduce<{
      regularObjects: SelectOption<string>[];
      systemObjects: SelectOption<string>[];
    }>(
      (accumulator, item) => {
        if (item.isActive === false) {
          return accumulator;
        }

        const option = {
          label: item.labelPlural,
          value: item.nameSingular,
          ...getSelectIconPropsFromObjectMetadataItem(item),
        };

        if (item.isSystem === true) {
          accumulator.systemObjects.push(option);
        } else {
          accumulator.regularObjects.push(option);
        }

        return accumulator;
      },
      { regularObjects: [], systemObjects: [] },
    );
  }, [getSelectIconPropsFromObjectMetadataItem, objectMetadataItems]);

  const selectableOptions = useMemo(
    () => [...regularObjects, ...systemObjects],
    [regularObjects, systemObjects],
  );

  const selectedOption =
    selectableOptions.find(
      (option) => option.value === triggerEvent?.objectType,
    ) || defaultSelectedOption;

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === selectedOption.value,
  );

  const filteredObjects = useMemo(
    () => [
      ...filterOptionsBySearch(regularObjects, searchInputValue),
      ...filterOptionsBySearch(systemObjects, searchInputValue),
    ],
    [regularObjects, searchInputValue, systemObjects],
  );

  const selectableItemIdArray = filteredObjects.map((option) => option.value);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const handleOptionClick = (value: string) => {
    if (triggerOptions.readonly === true) {
      return;
    }

    triggerOptions.onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        eventName: `${value}.${triggerEvent.event}`,
      },
    });
    closeDropdown(dropdownId);
  };

  const handleFieldsChange = (fields: FieldMultiSelectValue | string) => {
    if (triggerOptions.readonly === true) {
      return;
    }

    triggerOptions.onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        fields: isDefined(fields)
          ? Array.isArray(fields)
            ? fields
            : [fields]
          : null,
      },
    });
  };

  const handleFilterSettingsUpdate = (filterSettings: FilterSettings) => {
    if (triggerOptions.readonly === true) {
      return;
    }

    triggerOptions.onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        filter: {
          stepFilterGroups: filterSettings.stepFilterGroups ?? [],
          stepFilters: filterSettings.stepFilters ?? [],
        },
      },
    });
  };

  return (
    <>
      <WorkflowStepBody>
        <StyledRecordTypeSelectContainer fullWidth>
          <StyledLabel>{t`Record Type`}</StyledLabel>
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponent={
              <SelectControl
                isDisabled={triggerOptions.readonly}
                selectedOption={selectedOption}
              />
            }
            dropdownComponents={
              <>
                {!triggerOptions.readonly && (
                  <DropdownContent
                    widthInPixels={GenericDropdownContentWidth.ExtraLarge}
                  >
                    <DropdownMenuSearchInput
                      autoFocus
                      value={searchInputValue}
                      onChange={(event) =>
                        setSearchInputValue(event.target.value)
                      }
                    />
                    <DropdownMenuSeparator />
                    <DropdownMenuItemsContainer hasMaxHeight>
                      <SelectableList
                        selectableListInstanceId={dropdownId}
                        focusId={dropdownId}
                        selectableItemIdArray={selectableItemIdArray}
                      >
                        {filteredObjects.map((option) => (
                          <SelectableListItem
                            key={option.value}
                            itemId={option.value}
                            onEnter={() => handleOptionClick(option.value)}
                          >
                            <MenuItem
                              focused={selectedItemId === option.value}
                              LeftIcon={option.Icon}
                              text={option.label}
                              onClick={() => handleOptionClick(option.value)}
                            />
                          </SelectableListItem>
                        ))}
                      </SelectableList>
                    </DropdownMenuItemsContainer>
                  </DropdownContent>
                )}
              </>
            }
            dropdownOffset={{ y: 4 }}
          />
        </StyledRecordTypeSelectContainer>
        {isDefined(selectedObjectMetadataItem) && isFieldFilteringSupported && (
          <WorkflowFieldsMultiSelect
            label={t`Fields (Optional)`}
            placeholder={t`Select specific fields to listen to`}
            objectMetadataItem={selectedObjectMetadataItem}
            handleFieldsChange={handleFieldsChange}
            readonly={triggerOptions.readonly ?? false}
            defaultFields={trigger.settings.fields}
            actionType="DATABASE_EVENT"
          />
        )}
        {isDefined(selectedObjectMetadataItem) && (
          <WorkflowStepFilterBuilder
            instanceId={TRIGGER_STEP_ID}
            defaultValue={
              trigger.settings.filter ?? {
                stepFilterGroups: [],
                stepFilters: [],
              }
            }
            readonly={triggerOptions.readonly ?? false}
            onFilterSettingsUpdate={handleFilterSettingsUpdate}
          />
        )}
      </WorkflowStepBody>
      {!triggerOptions.readonly && (
        <WorkflowStepFooter stepId={TRIGGER_STEP_ID} />
      )}
    </>
  );
};
