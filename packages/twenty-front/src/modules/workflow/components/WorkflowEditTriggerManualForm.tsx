import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowManualTrigger } from '@/workflow/types/Workflow';
import { getManualTriggerDefaultSettings } from '@/workflow/utils/getManualTriggerDefaultSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useId } from 'react';
import { IconCheckbox, IconHandMove, IconSquare } from 'twenty-ui';

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

type WorkflowEditTriggerManualFormProps =
  | {
      trigger: WorkflowManualTrigger;
      readonly: true;
      onTriggerUpdate?: undefined;
    }
  | {
      trigger: WorkflowManualTrigger;
      readonly?: false;
      onTriggerUpdate: (trigger: WorkflowManualTrigger) => void;
    };

export const WorkflowEditTriggerManualForm = ({
  trigger,
  readonly,
  onTriggerUpdate,
}: WorkflowEditTriggerManualFormProps) => {
  const theme = useTheme();

  const inputRootId = useId();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  return (
    <>
      <StyledTriggerHeader>
        <StyledTriggerHeaderIconContainer>
          <IconHandMove color={theme.font.color.tertiary} />
        </StyledTriggerHeaderIconContainer>

        <StyledTriggerHeaderTitle>Manual Trigger</StyledTriggerHeaderTitle>

        <StyledTriggerHeaderType>Trigger · Manual</StyledTriggerHeaderType>
      </StyledTriggerHeader>

      <StyledTriggerSettings>
        <Select
          dropdownId={`${inputRootId}-availability`}
          label="Available"
          fullWidth
          disabled={readonly}
          value={trigger.settings.type}
          options={[
            {
              label: 'When record(s) are selected',
              value: 'WHEN_RECORD_SELECTED',
              Icon: IconCheckbox,
            },
            {
              label: 'When no record(s) are selected',
              value: 'EVERYWHERE',
              Icon: IconSquare,
            },
          ]}
          onChange={(updatedTriggerType) => {
            if (readonly === true) {
              return;
            }

            onTriggerUpdate({
              ...trigger,
              settings: getManualTriggerDefaultSettings({
                availability: updatedTriggerType,
                activeObjectMetadataItems,
              }),
            });
          }}
        />

        {trigger.settings.type === 'WHEN_RECORD_SELECTED' ? (
          <Select
            dropdownId={`${inputRootId}-object`}
            label="Object"
            fullWidth
            value={trigger.settings.objectType}
            options={availableMetadata}
            disabled={readonly}
            onChange={(updatedObject) => {
              if (readonly === true) {
                return;
              }

              onTriggerUpdate({
                ...trigger,
                settings: {
                  type: 'WHEN_RECORD_SELECTED',
                  objectType: updatedObject,
                },
              });
            }}
          />
        ) : null}
      </StyledTriggerSettings>
    </>
  );
};
