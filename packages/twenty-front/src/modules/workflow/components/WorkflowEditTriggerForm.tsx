import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { OBJECT_EVENT_TRIGGERS } from '@/workflow/constants/ObjectEventTriggers';
import { WorkflowTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlaylistAdd, isDefined } from 'twenty-ui';

const StyledTriggerHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledTriggerHeaderTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};

  margin: ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledTriggerHeaderType = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

const StyledTriggerHeaderIconContainer = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledTriggerSettings = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

type WorkflowEditTriggerFormProps =
  | {
      trigger: WorkflowTrigger | undefined;
      readonly: true;
      onTriggerUpdate?: undefined;
    }
  | {
      trigger: WorkflowTrigger | undefined;
      readonly?: false;
      onTriggerUpdate: (trigger: WorkflowTrigger) => void;
    };

export const WorkflowEditTriggerForm = ({
  trigger,
  readonly,
  onTriggerUpdate,
}: WorkflowEditTriggerFormProps) => {
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

  return (
    <>
      <StyledTriggerHeader>
        <StyledTriggerHeaderIconContainer>
          <IconPlaylistAdd color={theme.font.color.tertiary} />
        </StyledTriggerHeaderIconContainer>

        <StyledTriggerHeaderTitle>
          {isDefined(recordTypeMetadata) && isDefined(selectedEvent)
            ? `When a ${recordTypeMetadata.labelSingular} is ${selectedEvent.label}`
            : '-'}
        </StyledTriggerHeaderTitle>

        <StyledTriggerHeaderType>
          {isDefined(selectedEvent)
            ? `Trigger . Record is ${selectedEvent.label}`
            : '-'}
        </StyledTriggerHeaderType>
      </StyledTriggerHeader>

      <StyledTriggerSettings>
        <Select
          dropdownId="workflow-edit-trigger-record-type"
          label="Record Type"
          fullWidth
          disabled={readonly}
          value={triggerEvent?.objectType}
          options={availableMetadata}
          onChange={(updatedRecordType) => {
            if (readonly === true) {
              return;
            }

            onTriggerUpdate(
              isDefined(trigger) && isDefined(triggerEvent)
                ? {
                    ...trigger,
                    settings: {
                      ...trigger.settings,
                      eventName: `${updatedRecordType}.${triggerEvent.event}`,
                    },
                  }
                : {
                    type: 'DATABASE_EVENT',
                    settings: {
                      eventName: `${updatedRecordType}.${OBJECT_EVENT_TRIGGERS[0].value}`,
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
          options={OBJECT_EVENT_TRIGGERS}
          disabled={readonly}
          onChange={(updatedEvent) => {
            if (readonly === true) {
              return;
            }

            onTriggerUpdate(
              isDefined(trigger) && isDefined(triggerEvent)
                ? {
                    ...trigger,
                    settings: {
                      ...trigger.settings,
                      eventName: `${triggerEvent.objectType}.${updatedEvent}`,
                    },
                  }
                : {
                    type: 'DATABASE_EVENT',
                    settings: {
                      eventName: `${availableMetadata[0].value}.${updatedEvent}`,
                    },
                  },
            );
          }}
        />
      </StyledTriggerSettings>
    </>
  );
};
