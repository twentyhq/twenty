import { t } from '@lingui/core/macro';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { type WorkflowUpdateRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { type UpdateRecordFormData } from '@/workflow/workflow-steps/workflow-actions/types/update-record-form-data.type';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { HorizontalSeparator, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { RelationType } from '~/generated-metadata/graphql';

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

export const WorkflowEditActionUpdateRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionUpdateRecordProps) => {
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
    objectNameSingular: action.settings.input.objectName,
    objectRecordId: action.settings.input.objectRecordId,
    fieldsToUpdate: action.settings.input.fieldsToUpdate ?? [],
    ...action.settings.input.objectRecord,
  });

  const isFormDisabled = actionOptions.readonly === true;

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
      shouldDisplayFormField({
        fieldMetadataItem,
        actionType: 'UPDATE_RECORD',
      }),
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
        objectNameSingular: updatedObjectName,
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
            fieldsToUpdate: updatedFieldsToUpdate ?? [],
            objectRecord: updatedOtherFields,
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

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-update-record-object-name"
          label={t`Object`}
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectNameSingular}
          emptyOption={{ label: t`Select an option`, value: '' }}
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

        {isDefined(objectNameSingular) && (
          <FormSingleRecordPicker
            testId="workflow-update-record-object-record-id"
            label={t`Record`}
            onChange={(objectRecordId) =>
              handleFieldChange('objectRecordId', objectRecordId)
            }
            objectNameSingulars={[objectNameSingular]}
            defaultValue={formData.objectRecordId}
            disabled={isFormDisabled}
            VariablePicker={WorkflowVariablePicker}
          />
        )}

        {isDefined(selectedObjectMetadataItem) && (
          <WorkflowFieldsMultiSelect
            label={t`Fields to update`}
            placeholder={t`Select fields to update`}
            objectMetadataItem={selectedObjectMetadataItem}
            handleFieldsChange={(fieldsToUpdate) =>
              handleFieldChange('fieldsToUpdate', fieldsToUpdate)
            }
            readonly={isFormDisabled ?? false}
            defaultFields={formData.fieldsToUpdate}
            actionType="UPDATE_RECORD"
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
              readonly={isFormDisabled}
            />
          );
        })}
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
