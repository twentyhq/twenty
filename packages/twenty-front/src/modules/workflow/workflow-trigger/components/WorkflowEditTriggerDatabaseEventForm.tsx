import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
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
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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

const filterOptionsBySearch = <T extends { label: string }>(
  options: T[],
  searchValue: string,
): T[] => {
  if (!searchValue) return options;
  return options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
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
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSystemObjectsOpen, setIsSystemObjectsOpen] = useState(false);
  const dropdownId = 'workflow-edit-trigger-record-type';

  const { closeDropdown } = useCloseDropdown();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const triggerEvent = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );
  const isUpdateEvent = triggerEvent.event === 'updated';
  const isUpsertEvent = triggerEvent.event === 'upserted';
  const isFieldFilteringSupported = isUpdateEvent || isUpsertEvent;

  const defaultSelectedOption = useMemo(
    () => ({ label: t`Select an option`, value: '' }),
    [t],
  );

  const regularObjects = objectMetadataItems
    .filter((item) => item.isActive && !item.isSystem)
    .map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    }));

  const systemObjects = objectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    }));

  const selectedOption =
    [...regularObjects, ...systemObjects].find(
      (option) => option.value === triggerEvent?.objectType,
    ) || defaultSelectedOption;

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === selectedOption.value,
  );

  const filteredRegularObjects = useMemo(
    () => filterOptionsBySearch(regularObjects, searchInputValue),
    [regularObjects, searchInputValue],
  );

  const filteredSystemObjects = useMemo(
    () => filterOptionsBySearch(systemObjects, searchInputValue),
    [systemObjects, searchInputValue],
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
        fields: fields ? (Array.isArray(fields) ? fields : [fields]) : null,
      },
    });
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
          <StyledLabel>{t`Record Type`}</StyledLabel>
          <Dropdown
            dropdownId="workflow-edit-trigger-record-type"
            dropdownPlacement="bottom-start"
            clickableComponent={
              <SelectControl
                isDisabled={triggerOptions.readonly}
                selectedOption={selectedOption}
              />
            }
            dropdownComponents={
              <>
                {!triggerOptions.readonly &&
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
                        {filteredSystemObjects.map((option) => (
                          <MenuItem
                            key={option.value}
                            LeftIcon={option.Icon}
                            text={option.label}
                            onClick={() => handleOptionClick(option.value)}
                          />
                        ))}
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
                        {filteredRegularObjects.map((option) => (
                          <MenuItem
                            key={option.value}
                            LeftIcon={option.Icon}
                            text={option.label}
                            onClick={() => handleOptionClick(option.value)}
                          />
                        ))}
                        {(!searchInputValue ||
                          'advanced'.includes(
                            searchInputValue.toLowerCase(),
                          )) && (
                          <MenuItem
                            text={t`Advanced`}
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
        </StyledRecordTypeSelectContainer>
        {isDefined(selectedObjectMetadataItem) && isFieldFilteringSupported && (
          <WorkflowFieldsMultiSelect
            label={t`Fields (Optional)`}
            placeholder={t`Select specific fields to listen to`}
            objectMetadataItem={selectedObjectMetadataItem}
            handleFieldsChange={handleFieldsChange}
            readonly={triggerOptions.readonly ?? false}
            defaultFields={trigger.settings.fields}
            actionType="UPDATE_RECORD"
          />
        )}
      </WorkflowStepBody>
      {!triggerOptions.readonly && (
        <WorkflowStepFooter stepId={TRIGGER_STEP_ID} />
      )}
    </>
  );
};
