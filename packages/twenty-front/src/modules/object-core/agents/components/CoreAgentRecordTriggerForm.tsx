import { useLingui } from '@lingui/react/macro';
import { type AgentDatabaseEventTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';

type CoreAgentRecordTriggerFormProps = {
  trigger: AgentDatabaseEventTrigger;
  onTriggerUpdate: (trigger: AgentDatabaseEventTrigger) => void;
  isReadOnly: boolean;
};

export const CoreAgentRecordTriggerForm = ({
  trigger,
  onTriggerUpdate,
  isReadOnly,
}: CoreAgentRecordTriggerFormProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const objectOptions = useObjectMetadataItemSelectOptions();

  const { objectType, event } = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.isActive && item.nameSingular === objectType,
  );

  const handleFieldsChange = (fields: FieldMultiSelectValue | string) => {
    const updatedFields = Array.isArray(fields)
      ? fields
      : isDefined(fields)
        ? [fields]
        : [];

    onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        updatedFields: updatedFields.length > 0 ? updatedFields : undefined,
      },
    });
  };

  return (
    <WorkflowStepBody>
      <Select
        dropdownId={`core-agent-trigger-record-type-${trigger.id}`}
        label={t`Record Type`}
        fullWidth
        disabled={isReadOnly}
        value={objectType}
        emptyOption={{ label: t`Select an option`, value: '' }}
        options={objectOptions}
        onChange={(nextObjectType) =>
          onTriggerUpdate({
            ...trigger,
            settings: {
              ...trigger.settings,
              eventName: `${nextObjectType}.${event}`,
              updatedFields: undefined,
            },
          })
        }
        withSearchInput
        dropdownSideOffset={4}
        dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
      />
      {isDefined(selectedObjectMetadataItem) && event === 'updated' && (
        <WorkflowFieldsMultiSelect
          key={objectType}
          label={t`Fields (Optional)`}
          placeholder={t`Select specific fields to listen to`}
          objectMetadataItem={selectedObjectMetadataItem}
          handleFieldsChange={handleFieldsChange}
          readonly={isReadOnly}
          defaultFields={trigger.settings.updatedFields}
          actionType="DATABASE_EVENT"
        />
      )}
    </WorkflowStepBody>
  );
};
