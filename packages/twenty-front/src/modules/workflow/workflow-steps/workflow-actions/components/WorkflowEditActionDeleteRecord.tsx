import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormSingleRecordPicker } from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { Select } from '@/ui/input/components/Select';
import { WorkflowDeleteRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useEffect, useState } from 'react';

import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionDeleteRecordProps = {
  action: WorkflowDeleteRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowDeleteRecordAction) => void;
      };
};

type DeleteRecordFormData = {
  objectName: string;
  objectRecordId: string;
};

export const WorkflowEditActionDeleteRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionDeleteRecordProps) => {
  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<DeleteRecordFormData>({
    objectName: action.settings.input.objectName,
    objectRecordId: action.settings.input.objectRecordId,
  });
  const isFormDisabled = actionOptions.readonly;

  const handleFieldChange = (
    fieldName: keyof DeleteRecordFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: DeleteRecordFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

  const objectNameSingular = activeNonSystemObjectMetadataItems.find(
    (item) => item.nameSingular === formData.objectName,
  )?.nameSingular;

  const saveAction = useDebouncedCallback(
    async (formData: DeleteRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectName: updatedObjectName,
        objectRecordId: updatedObjectRecordId,
      } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            objectRecordId: updatedObjectRecordId ?? '',
          },
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const headerTitle = isDefined(action.name) ? action.name : `Delete Record`;
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={isFormDisabled}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-record-delete-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(objectName) => {
            const newFormData: DeleteRecordFormData = {
              objectName,
              objectRecordId: '',
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
        />

        <HorizontalSeparator noMargin />

        {isDefined(objectNameSingular) && (
          <FormSingleRecordPicker
            label="Record"
            onChange={(objectRecordId) =>
              handleFieldChange('objectRecordId', objectRecordId)
            }
            objectNameSingular={objectNameSingular}
            defaultValue={formData.objectRecordId}
            testId="workflow-edit-action-record-delete-object-record-id"
            disabled={isFormDisabled}
            VariablePicker={WorkflowVariablePicker}
          />
        )}
      </WorkflowStepBody>
    </>
  );
};
