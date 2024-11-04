import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import { MANUAL_TRIGGER_AVAILABILITY_OPTIONS } from '@/workflow/constants/ManualTriggerAvailabilityOptions';
import {
  WorkflowManualTrigger,
  WorkflowManualTriggerAvailability,
} from '@/workflow/types/Workflow';
import { getManualTriggerDefaultSettings } from '@/workflow/utils/getManualTriggerDefaultSettings';
import { useTheme } from '@emotion/react';
import { IconHandMove, isDefined } from 'twenty-ui';

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

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const manualTriggerAvailability: WorkflowManualTriggerAvailability =
    isDefined(trigger.settings.objectType)
      ? 'WHEN_RECORD_SELECTED'
      : 'EVERYWHERE';

  return (
    <WorkflowEditGenericFormBase
      HeaderIcon={<IconHandMove color={theme.font.color.tertiary} />}
      headerTitle="Manual Trigger"
      headerType="Trigger · Manual"
    >
      <Select
        dropdownId="workflow-edit-manual-trigger-availability"
        label="Available"
        fullWidth
        disabled={readonly}
        value={manualTriggerAvailability}
        options={MANUAL_TRIGGER_AVAILABILITY_OPTIONS}
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

      {manualTriggerAvailability === 'WHEN_RECORD_SELECTED' ? (
        <Select
          dropdownId="workflow-edit-manual-trigger-object"
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
                objectType: updatedObject,
                outputSchema: {},
              },
            });
          }}
        />
      ) : null}
    </WorkflowEditGenericFormBase>
  );
};
