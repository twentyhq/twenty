import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { DATABASE_TRIGGER_EVENTS } from '@/workflow/workflow-trigger/constants/DatabaseTriggerEvents';
import { useTheme } from '@emotion/react';
import { IconPlaylistAdd, isDefined } from 'twenty-ui';

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

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const triggerEvent = splitWorkflowTriggerEventName(
    trigger.settings.eventName,
  );

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const selectedEvent = isDefined(triggerEvent)
    ? DATABASE_TRIGGER_EVENTS.find(
        (availableEvent) => availableEvent.value === triggerEvent.event,
      )
    : undefined;

  const headerTitle = isDefined(trigger.name)
    ? trigger.name
    : isDefined(selectedEvent)
      ? selectedEvent.label
      : '-';

  const headerType = isDefined(selectedEvent)
    ? `Trigger · ${selectedEvent.label}`
    : '-';

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (triggerOptions.readonly === true) {
            return;
          }

          triggerOptions.onTriggerUpdate({
            ...trigger,
            name: newName,
          });
        }}
        Icon={IconPlaylistAdd}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType={headerType}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-trigger-record-type"
          label="Record Type"
          fullWidth
          disabled={triggerOptions.readonly}
          value={triggerEvent?.objectType}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedRecordType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: {
                ...trigger.settings,
                eventName: `${updatedRecordType}.${triggerEvent.event}`,
              },
            });
          }}
        />
      </WorkflowStepBody>
    </>
  );
};
