import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowTrigger } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlaylistAdd } from 'twenty-ui';

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

export const RightDrawerWorkflowEditStepContentTrigger = ({
  trigger,
  onUpdateTrigger,
}: {
  trigger: WorkflowTrigger;
  onUpdateTrigger: (trigger: WorkflowTrigger) => void;
}) => {
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
  const recordTypeMetadata = activeObjectMetadataItems.find(
    (item) => item.nameSingular === triggerEvent.objectType,
  );
  if (recordTypeMetadata === undefined) {
    throw new Error(
      'Expected to find the metadata configuration for the currently selected record type of the trigger.',
    );
  }

  const availableEvents: Array<SelectOption<string>> = [
    {
      label: 'Created',
      value: 'created',
    },
    {
      label: 'Updated',
      value: 'updated',
    },
    {
      label: 'Deleted',
      value: 'deleted',
    },
  ];
  const eventLabel = availableEvents.find(
    (availableEvent) => availableEvent.value === triggerEvent.event,
  );
  if (eventLabel === undefined) {
    throw new Error('Expected to find the currently selected event type.');
  }

  return (
    <>
      <StyledTriggerHeader>
        <StyledTriggerHeaderIconContainer>
          <IconPlaylistAdd color={theme.font.color.tertiary} />
        </StyledTriggerHeaderIconContainer>

        <StyledTriggerHeaderTitle>
          When a {recordTypeMetadata.labelSingular} is {eventLabel.label}
        </StyledTriggerHeaderTitle>

        <StyledTriggerHeaderType>
          Trigger . Record is {eventLabel.label}
        </StyledTriggerHeaderType>
      </StyledTriggerHeader>

      <StyledTriggerSettings>
        <Select
          dropdownId="right-drawer-workflow-edit-step-trigger-record-type"
          label="Record Type"
          fullWidth
          value={triggerEvent.objectType}
          options={availableMetadata}
          onChange={(updatedRecordType) => {
            onUpdateTrigger({
              ...trigger,
              settings: {
                ...trigger.settings,
                eventName: `${updatedRecordType}.${triggerEvent.event}`,
              },
            });
          }}
        />
        <Select
          dropdownId="right-drawer-workflow-edit-step-trigger-event-type"
          label="Event type"
          fullWidth
          value={triggerEvent.event}
          options={availableEvents}
          onChange={(updatedEvent) => {
            onUpdateTrigger({
              ...trigger,
              settings: {
                ...trigger.settings,
                eventName: `${triggerEvent.objectType}.${updatedEvent}`,
              },
            });
          }}
        />
      </StyledTriggerSettings>
    </>
  );
};
