import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import {
  WorkflowManualTrigger,
  WorkflowManualTriggerAvailability,
} from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { MANUAL_TRIGGER_AVAILABILITY_OPTIONS } from '@/workflow/workflow-trigger/constants/ManualTriggerAvailabilityOptions';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';
import { getTriggerHeaderType } from '@/workflow/workflow-trigger/utils/getTriggerHeaderType';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerLabel';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

type WorkflowEditTriggerManualFormProps = {
  trigger: WorkflowManualTrigger;
  triggerOptions:
    | {
        readonly: true;
        onTriggerUpdate?: undefined;
      }
    | {
        readonly?: false;
        onTriggerUpdate: (trigger: WorkflowManualTrigger) => void;
      };
};

export const WorkflowEditTriggerManualForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerManualFormProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    }));

  const manualTriggerAvailability: WorkflowManualTriggerAvailability =
    isDefined(trigger.settings.objectType)
      ? 'WHEN_RECORD_SELECTED'
      : 'EVERYWHERE';

  const headerTitle = trigger.name ?? getTriggerDefaultLabel(trigger);

  const headerIcon = getTriggerIcon(trigger);
  const headerType = getTriggerHeaderType(trigger);

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
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={triggerOptions.readonly}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-manual-trigger-availability"
          label="Available"
          fullWidth
          disabled={triggerOptions.readonly}
          value={manualTriggerAvailability}
          options={MANUAL_TRIGGER_AVAILABILITY_OPTIONS}
          onChange={(updatedTriggerType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: getManualTriggerDefaultSettings({
                availability: updatedTriggerType,
                activeObjectMetadataItems,
              }),
            });
          }}
        />

        {manualTriggerAvailability === 'WHEN_RECORD_SELECTED' ? (
          <Select
            dropdownId="workflow-edit-manual-trigger-object"
            label="Object"
            fullWidth
            value={trigger.settings.objectType}
            options={availableMetadata}
            disabled={triggerOptions.readonly}
            onChange={(updatedObject) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              triggerOptions.onTriggerUpdate({
                ...trigger,
                settings: {
                  objectType: updatedObject,
                  outputSchema: {},
                },
              });
            }}
          />
        ) : null}
      </WorkflowStepBody>
    </>
  );
};
