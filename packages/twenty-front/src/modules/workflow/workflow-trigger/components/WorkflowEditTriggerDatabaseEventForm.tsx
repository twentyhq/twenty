import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { OBJECT_EVENT_TRIGGERS } from '@/workflow/workflow-trigger/constants/ObjectEventTriggers';
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

  const triggerEvent = isDefined(trigger)
    ? splitWorkflowTriggerEventName(trigger.settings.eventName)
    : undefined;

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
    }));
  const recordTypeMetadata = isDefined(triggerEvent)
    ? activeObjectMetadataItems.find(
        (item) => item.nameSingular === triggerEvent.objectType,
      )
    : undefined;

  const selectedEvent = isDefined(triggerEvent)
    ? OBJECT_EVENT_TRIGGERS.find(
        (availableEvent) => availableEvent.value === triggerEvent.event,
      )
    : undefined;

  const headerTitle = isDefined(trigger.name)
    ? trigger.name
    : isDefined(recordTypeMetadata) && isDefined(selectedEvent)
      ? `When a ${recordTypeMetadata.labelSingular} is ${selectedEvent.label}`
      : '-';

  const headerType = isDefined(selectedEvent)
    ? `Trigger · Record is ${selectedEvent.label}`
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

            triggerOptions.onTriggerUpdate(
              isDefined(trigger) && isDefined(triggerEvent)
                ? {
                    ...trigger,
                    settings: {
                      ...trigger.settings,
                      eventName: `${updatedRecordType}.${triggerEvent.event}`,
                    },
                  }
                : {
                    name: headerTitle,
                    type: 'DATABASE_EVENT',
                    settings: {
                      eventName: `${updatedRecordType}.${OBJECT_EVENT_TRIGGERS[0].value}`,
                      outputSchema: {},
                    },
                  },
            );
          }}
        />
        <Select
          dropdownId="workflow-edit-trigger-event-type"
          label="Event type"
          fullWidth
          value={triggerEvent?.event}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={OBJECT_EVENT_TRIGGERS}
          disabled={triggerOptions.readonly}
          onChange={(updatedEvent) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate(
              isDefined(trigger) && isDefined(triggerEvent)
                ? {
                    ...trigger,
                    settings: {
                      ...trigger.settings,
                      eventName: `${triggerEvent.objectType}.${updatedEvent}`,
                    },
                  }
                : {
                    name: headerTitle,
                    type: 'DATABASE_EVENT',
                    settings: {
                      eventName: `${availableMetadata?.[0].value}.${updatedEvent}`,
                      outputSchema: {},
                    },
                  },
            );
          }}
        />
      </WorkflowStepBody>
    </>
  );
};
