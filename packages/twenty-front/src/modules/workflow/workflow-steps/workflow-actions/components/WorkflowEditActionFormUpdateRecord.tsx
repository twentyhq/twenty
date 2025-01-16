import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowUpdateRecordAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import {
  HorizontalSeparator,
  IconAddressBook,
  isDefined,
  useIcons,
} from 'twenty-ui';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowSingleRecordPicker } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowSingleRecordPicker';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type WorkflowEditActionFormUpdateRecordProps = {
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

const AVAILABLE_FIELD_METADATA_TYPES = [
  FieldMetadataType.Text,
  FieldMetadataType.Number,
  FieldMetadataType.Date,
  FieldMetadataType.Boolean,
  FieldMetadataType.Select,
  FieldMetadataType.MultiSelect,
  FieldMetadataType.Emails,
  FieldMetadataType.Links,
  FieldMetadataType.FullName,
  FieldMetadataType.Address,
];

export const WorkflowEditActionFormUpdateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionFormUpdateRecordProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
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

  const selectedObjectMetadataItemNameSingular = formData.objectName;

  const selectedObjectMetadataItem = activeObjectMetadataItems.find(
    (item) => item.nameSingular === selectedObjectMetadataItemNameSingular,
  );
  if (!isDefined(selectedObjectMetadataItem)) {
    throw new Error('Should have found the metadata item');
  }

  const inlineFieldMetadataItems = selectedObjectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        !fieldMetadataItem.isSystem &&
        fieldMetadataItem.isActive &&
        AVAILABLE_FIELD_METADATA_TYPES.includes(fieldMetadataItem.type),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const inlineFieldDefinitions = inlineFieldMetadataItems.map(
    (fieldMetadataItem) =>
      formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItem,
        objectMetadataItem: selectedObjectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      }),
  );

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
        Icon={IconAddressBook}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType="Action"
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
        />

        <HorizontalSeparator noMargin />

        <WorkflowSingleRecordPicker
          label="Record"
          onChange={(objectRecordId) =>
            handleFieldChange('objectRecordId', objectRecordId)
          }
          objectNameSingular={formData.objectName}
          defaultValue={formData.objectRecordId}
        />

        <FormMultiSelectFieldInput
          label="Fields to update"
          defaultValue={formData.fieldsToUpdate}
          options={inlineFieldDefinitions.map((field) => ({
            label: field.label,
            value: field.metadata.fieldName,
            icon: getIcon(field.iconName),
            color: 'gray',
          }))}
          onPersist={(fieldsToUpdate) =>
            handleFieldChange('fieldsToUpdate', fieldsToUpdate)
          }
          placeholder="Select fields to update"
        />

        <HorizontalSeparator noMargin />

        {formData.fieldsToUpdate.map((fieldName) => {
          const fieldDefinition = inlineFieldDefinitions.find(
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
              onPersist={(value) => {
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
