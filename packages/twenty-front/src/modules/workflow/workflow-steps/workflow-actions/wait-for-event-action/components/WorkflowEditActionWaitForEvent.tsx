import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { useWorkflowObjectSelectOptions } from '@/workflow/hooks/useWorkflowObjectSelectOptions';
import { type WorkflowWaitForEventAction } from '@/workflow/types/Workflow';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';

type WaitForEventInput = WorkflowWaitForEventAction['settings']['input'];

type WaitForEventTimeout = NonNullable<WaitForEventInput['timeout']>;

type WaitForEventType = 'created' | 'updated' | 'deleted';

type WorkflowEditActionWaitForEventProps = {
  action: WorkflowWaitForEventAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowWaitForEventAction) => void;
      };
};

export const WorkflowEditActionWaitForEvent = ({
  action,
  actionOptions,
}: WorkflowEditActionWaitForEventProps) => {
  const { t } = useLingui();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const objectOptions = useWorkflowObjectSelectOptions();

  const [timeoutDraft, setTimeoutDraft] = useState<WaitForEventTimeout>(
    () => action.settings.input.timeout ?? {},
  );

  const { objectType, event } = splitWorkflowTriggerEventName(
    action.settings.input.eventName,
  );

  const eventOptions: Array<SelectOption<WaitForEventType>> = [
    { label: t`Record is created`, value: 'created' },
    { label: t`Record is updated`, value: 'updated' },
    { label: t`Record is deleted`, value: 'deleted' },
  ];

  const selectedEvent = eventOptions.find(
    (eventOption) => eventOption.value === event,
  )?.value;

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.isActive && item.nameSingular === objectType,
  );

  const updateInput = (input: Partial<WaitForEventInput>) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          ...input,
        },
      },
    });
  };

  // a record and fields only make sense for the object they were picked on
  const handleObjectTypeChange = (newObjectType: string) => {
    updateInput({
      eventName: `${newObjectType}.${selectedEvent ?? 'updated'}`,
      recordId: null,
      updatedFields: null,
    });
  };

  const handleEventChange = (newEvent: WaitForEventType) => {
    updateInput({
      eventName: `${objectType}.${newEvent}`,
      ...(newEvent === 'updated' ? {} : { updatedFields: null }),
    });
  };

  const handleUpdatedFieldsChange = (fields: FieldMultiSelectValue | string) => {
    updateInput({
      updatedFields: isDefined(fields)
        ? Array.isArray(fields)
          ? fields
          : [fields]
        : null,
    });
  };

  const handleTimeoutDraftChange = (
    unit: keyof WaitForEventTimeout,
    value: number | string | null,
  ) => {
    setTimeoutDraft((previousTimeout) => ({
      ...previousTimeout,
      [unit]: value ?? undefined,
    }));
  };

  const handleTimeoutCommit = () => {
    updateInput({ timeout: timeoutDraft });
  };

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-wait-for-event-object"
          label={t`Record Type`}
          fullWidth
          disabled={actionOptions.readonly === true}
          value={objectType}
          emptyOption={{ label: t`Select an option`, value: '' }}
          options={objectOptions}
          onChange={handleObjectTypeChange}
          withSearchInput
          dropdownSideOffset={4}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
        <Select
          dropdownId="workflow-edit-action-wait-for-event-event"
          label={t`Event`}
          fullWidth
          disabled={actionOptions.readonly === true}
          value={selectedEvent}
          options={eventOptions}
          onChange={handleEventChange}
          dropdownWidth={GenericDropdownContentWidth.Large}
        />
        {isDefined(selectedObjectMetadataItem) && (
          <FormSingleRecordPicker
            testId="workflow-wait-for-event-record-id"
            label={t`Record (Optional)`}
            onChange={(recordId) => updateInput({ recordId })}
            objectNameSingulars={[selectedObjectMetadataItem.nameSingular]}
            defaultValue={action.settings.input.recordId ?? undefined}
            disabled={actionOptions.readonly === true}
            VariablePicker={WorkflowVariablePicker}
          />
        )}
        {isDefined(selectedObjectMetadataItem) && event === 'updated' && (
          <WorkflowFieldsMultiSelect
            label={t`Fields (Optional)`}
            placeholder={t`Select specific fields to wait for`}
            objectMetadataItem={selectedObjectMetadataItem}
            handleFieldsChange={handleUpdatedFieldsChange}
            readonly={actionOptions.readonly ?? false}
            defaultFields={action.settings.input.updatedFields}
            actionType="DATABASE_EVENT"
          />
        )}
        <HorizontalSeparator noMargin />
        <FormNumberFieldInput
          label={t`Timeout days (Optional)`}
          defaultValue={timeoutDraft.days}
          onChange={(value) => handleTimeoutDraftChange('days', value)}
          onBlur={handleTimeoutCommit}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
          placeholder={t`0`}
        />
        <FormNumberFieldInput
          label={t`Timeout hours (Optional)`}
          defaultValue={timeoutDraft.hours}
          onChange={(value) => handleTimeoutDraftChange('hours', value)}
          onBlur={handleTimeoutCommit}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
          placeholder={t`0`}
        />
        <FormNumberFieldInput
          label={t`Timeout minutes (Optional)`}
          defaultValue={timeoutDraft.minutes}
          onChange={(value) => handleTimeoutDraftChange('minutes', value)}
          onBlur={handleTimeoutCommit}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
          placeholder={t`0`}
        />
      </WorkflowStepBody>

      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
