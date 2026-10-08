import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

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
  const dropdownId = 'workflow-edit-trigger-record-type';

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const objectOptions = useObjectMetadataItemSelectOptions();

  const triggerEvent = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );
  const isUpdateEvent = triggerEvent.event === 'updated';
  const isUpsertEvent = triggerEvent.event === 'upserted';
  const isFieldFilteringSupported = isUpdateEvent || isUpsertEvent;

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.isActive && item.nameSingular === triggerEvent.objectType,
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
        <Select
          dropdownId={dropdownId}
          label={t`Record Type`}
          fullWidth
          disabled={triggerOptions.readonly === true}
          value={triggerEvent.objectType}
          emptyOption={{ label: t`Select an option`, value: '' }}
          options={objectOptions}
          onChange={handleOptionClick}
          withSearchInput
          dropdownSideOffset={4}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
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
