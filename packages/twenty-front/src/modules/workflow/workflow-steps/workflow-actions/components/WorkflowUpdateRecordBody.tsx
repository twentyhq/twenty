import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { useEffect, useState } from 'react';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { type UpdateRecordFormData } from '@/workflow/workflow-steps/workflow-actions/types/update-record-form-data.type';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';

type WorkflowUpdateRecordBodyProps = {
  defaultObjectNameSingular: string;
  defaultFieldsToUpdate: string[];
  defaultObjectRecord: Record<string, unknown>;
  defaultObjectRecordId?: string;
  actionType: 'UPDATE_RECORD' | 'UPSERT_RECORD';
  readonly: boolean;
  onUpdate: (formData: UpdateRecordFormData) => void;
  shouldPickRecord: boolean;
};

export const WorkflowUpdateRecordBody = ({
  defaultObjectNameSingular,
  defaultFieldsToUpdate,
  defaultObjectRecord,
  defaultObjectRecordId,
  readonly,
  actionType,
  onUpdate,
  shouldPickRecord,
}: WorkflowUpdateRecordBodyProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems
      .filter((objectMetadataItem) =>
        canObjectBeManagedByWorkflow({
          nameSingular: objectMetadataItem.nameSingular,
          isSystem: objectMetadataItem.isSystem,
        }),
      )
      .map((item) => ({
        Icon: getIcon(item.icon),
        label: item.labelPlural,
        value: item.nameSingular,
      }));

  const [formData, setFormData] = useState<UpdateRecordFormData>({
    objectNameSingular: defaultObjectNameSingular,
    objectRecordId: defaultObjectRecordId,
    fieldsToUpdate: defaultFieldsToUpdate ?? [],
    ...defaultObjectRecord,
  });

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
    (item) => item.nameSingular === formData.objectNameSingular,
  );

  const objectNameSingular = selectedObjectMetadataItem?.nameSingular;

  const inlineFieldMetadataItems = selectedObjectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({ fieldMetadataItem, actionType }),
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
      if (readonly === true) {
        return;
      }

      const {
        objectNameSingular: updatedObjectName,
        objectRecordId: updatedObjectRecordId,
        fieldsToUpdate: updatedFieldsToUpdate,
        ...updatedOtherFields
      } = formData;

      onUpdate({
        objectNameSingular: updatedObjectName,
        objectRecordId: updatedObjectRecordId ?? '',
        fieldsToUpdate: updatedFieldsToUpdate ?? [],
        ...updatedOtherFields,
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  return (
    <WorkflowStepBody>
      <Select
        dropdownId="workflow-update-record-object-name"
        label="Object"
        fullWidth
        disabled={readonly}
        value={formData.objectNameSingular}
        emptyOption={{ label: 'Select an option', value: '' }}
        options={availableMetadata}
        onChange={(updatedObjectName) => {
          const newFormData: UpdateRecordFormData = {
            objectNameSingular: updatedObjectName,
            objectRecordId: '',
            fieldsToUpdate: [],
          };

          setFormData(newFormData);

          saveAction(newFormData);
        }}
        withSearchInput
        dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
        dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
      />

      <HorizontalSeparator noMargin />

      {isDefined(objectNameSingular) && shouldPickRecord && (
        <FormSingleRecordPicker
          testId="workflow-update-record-object-record-id"
          label="Record"
          onChange={(objectRecordId) =>
            handleFieldChange('objectRecordId', objectRecordId)
          }
          objectNameSingulars={[objectNameSingular]}
          defaultValue={formData.objectRecordId}
          disabled={readonly}
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
          readonly={readonly ?? false}
          defaultFields={formData.fieldsToUpdate}
        />
      )}

      <HorizontalSeparator noMargin />

      {formData.fieldsToUpdate.map((fieldName) => {
        const fieldDefinition = inlineFieldDefinitions?.find((definition) => {
          const isFieldRelationManyToOne =
            isFieldRelation(definition) &&
            definition.metadata.relationType === RelationType.MANY_TO_ONE;

          const value = isFieldRelationManyToOne
            ? `${definition.metadata.fieldName}Id`
            : definition.metadata.fieldName;

          return value === fieldName;
        });

        if (!isDefined(fieldDefinition)) {
          return null;
        }

        const currentValue = formData[fieldName] as JsonValue;

        return (
          <FormFieldInput
            key={fieldName}
            defaultValue={currentValue}
            field={fieldDefinition}
            onChange={(value) => {
              handleFieldChange(fieldName, value);
            }}
            VariablePicker={WorkflowVariablePicker}
            readonly={readonly}
          />
        );
      })}
    </WorkflowStepBody>
  );
};
