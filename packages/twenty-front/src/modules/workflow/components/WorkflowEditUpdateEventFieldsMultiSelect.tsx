import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';

export const WorkflowFieldsMultiSelect = ({
  label,
  objectMetadataItem,
  handleFieldsChange,
  readonly,
  defaultFields,
  placeholder,
}: {
  label: string;
  placeholder: string;
  objectMetadataItem: ObjectMetadataItem;
  handleFieldsChange: (field: FieldMultiSelectValue | string) => void;
  readonly: boolean;
  defaultFields: string[] | undefined | null;
}) => {
  const { getIcon } = useIcons();

  const inlineFieldMetadataItems = objectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({
        fieldMetadataItem,
        actionType: 'UPDATE_RECORD',
      }),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const inlineFieldDefinitions = isDefined(objectMetadataItem)
    ? inlineFieldMetadataItems.map((fieldMetadataItem) =>
        formatFieldMetadataItemAsFieldDefinition({
          field: fieldMetadataItem,
          objectMetadataItem: objectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
      )
    : [];

  return (
    <FormMultiSelectFieldInput
      testId="workflow-fields-multi-select"
      label={label}
      defaultValue={defaultFields}
      options={inlineFieldDefinitions.map((field) => ({
        label: field.label,
        value: field.metadata.fieldName,
        icon: getIcon(field.iconName),
        color: 'gray',
      }))}
      onChange={handleFieldsChange}
      placeholder={placeholder}
      readonly={readonly}
    />
  );
};
