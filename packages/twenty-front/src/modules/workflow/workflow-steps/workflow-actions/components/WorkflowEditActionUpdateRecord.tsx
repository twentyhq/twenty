import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { WorkflowUpdateRecordAction } from '@/workflow/types/Workflow';
import { useEffect, useState } from 'react';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';

type WorkflowEditActionUpdateRecordProps = {
  action: WorkflowUpdateRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowUpdateRecordAction) => void;
      };
};

type UpdateRecordFormData = {
  objectName: string;
  objectRecordId: string;
  fieldsToUpdate: string[];
  [field: string]: unknown;
};

export const WorkflowEditActionUpdateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionUpdateRecordProps) => {
  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  const [formData, setFormData] = useState<UpdateRecordFormData>({
    objectName: action.settings.input.objectName,
    objectRecordId: action.settings.input.objectRecordId,
    fieldsToUpdate: action.settings.input.fieldsToUpdate ?? [],
    ...action.settings.input.objectRecord,
  });
  const isFormDisabled = actionOptions.readonly;

  const handleFieldChange = (
    fieldName: keyof UpdateRecordFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: UpdateRecordFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);

    saveAction(newFormData);
  };

  const selectedObjectMetadataItem = activeNonSystemObjectMetadataItems.find(
    (item) => item.nameSingular === formData.objectName,
  );

  const objectNameSingular = selectedObjectMetadataItem?.nameSingular;

  const inlineFieldMetadataItems = selectedObjectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({ fieldMetadataItem, actionType: action.type }),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const inlineFieldDefinitions = isDefined(selectedObjectMetadataItem)
    ? inlineFieldMetadataItems?.map((fieldMetadataItem) =>
        formatFieldMetadataItemAsFieldDefinition({
          field: fieldMetadataItem,
          objectMetadataItem: selectedObjectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
      )
    : [];

  const saveAction = useDebouncedCallback(
    async (formData: UpdateRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      const {
        objectName: updatedObjectName,
        objectRecordId: updatedObjectRecordId,
        fieldsToUpdate: updatedFieldsToUpdate,
        ...updatedOtherFields
      } = formData;

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedObjectName,
            objectRecordId: updatedObjectRecordId ?? '',
            objectRecord: updatedOtherFields,
            fieldsToUpdate: updatedFieldsToUpdate ?? [],
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

  const headerTitle = isDefined(action.name) ? action.name : `Update Record`;
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
          dropdownId="workflow-edit-action-record-update-object-name"
          label="Object"
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            const newFormData: UpdateRecordFormData = {
              objectName: updatedObjectName,
              objectRecordId: '',
              fieldsToUpdate: [],
            };

            setFormData(newFormData);

            saveAction(newFormData);
          }}
          withSearchInput
        />

        <HorizontalSeparator noMargin />

        {isDefined(objectNameSingular) && (
          <FormSingleRecordPicker
            testId="workflow-edit-action-record-update-object-record-id"
            label="Record"
            onChange={(objectRecordId) =>
              handleFieldChange('objectRecordId', objectRecordId)
            }
            objectNameSingular={objectNameSingular}
            defaultValue={formData.objectRecordId}
            disabled={isFormDisabled}
            VariablePicker={WorkflowVariablePicker}
          />
        )}

        {isDefined(selectedObjectMetadataItem) && (
          <WorkflowFieldsMultiSelect
            label="Fields to update"
            placeholder="Select fields to update"
            objectMetadataItem={selectedObjectMetadataItem}
            handleFieldsChange={(fieldsToUpdate) =>
              handleFieldChange('fieldsToUpdate', fieldsToUpdate)
            }
            readonly={isFormDisabled ?? false}
            defaultFields={formData.fieldsToUpdate}
          />
        )}

        <HorizontalSeparator noMargin />

        {formData.fieldsToUpdate.map((fieldName) => {
          const fieldDefinition = inlineFieldDefinitions?.find(
            (definition) => definition.metadata.fieldName === fieldName,
          );

          if (!isDefined(fieldDefinition)) {
            return null;
          }

          const currentValue = formData[
            fieldDefinition.metadata.fieldName
          ] as JsonValue;

          return (
            <FormFieldInput
              key={fieldDefinition.metadata.fieldName}
              defaultValue={currentValue}
              field={fieldDefinition}
              onChange={(value) => {
                handleFieldChange(fieldDefinition.metadata.fieldName, value);
              }}
              VariablePicker={WorkflowVariablePicker}
              readonly={isFormDisabled}
            />
          );
        })}
      </WorkflowStepBody>
    </>
  );
};
