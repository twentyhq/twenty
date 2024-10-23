import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import { WorkflowManualTrigger } from '@/workflow/types/Workflow';
import { getManualTriggerDefaultSettings } from '@/workflow/utils/getManualTriggerDefaultSettings';
import { useTheme } from '@emotion/react';
import { useId } from 'react';
import { IconCheckbox, IconHandMove, IconSquare } from 'twenty-ui';

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
    <WorkflowEditGenericFormBase
      HeaderIcon={<IconHandMove color={theme.font.color.tertiary} />}
      headerTitle="Manual Trigger"
      headerType="Trigger · Manual"
    >
      <Select
        dropdownId={`${inputRootId}-availability`}
        label="Available"
        fullWidth
        disabled={readonly}
        value={trigger.settings.availability}
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

      {trigger.settings.availability === 'WHEN_RECORD_SELECTED' ? (
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
                availability: 'WHEN_RECORD_SELECTED',
                objectType: updatedObject,
              },
            });
          }}
        />
      ) : null}
    </WorkflowEditGenericFormBase>
  );
};
