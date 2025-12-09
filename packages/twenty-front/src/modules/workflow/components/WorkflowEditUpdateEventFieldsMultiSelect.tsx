import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';

export const WorkflowFieldsMultiSelect = ({
  label,
  objectMetadataItem,
  handleFieldsChange,
  readonly,
  defaultFields,
  placeholder,
  hint,
  actionType,
}: {
  label: string;
  placeholder: string;
  objectMetadataItem: ObjectMetadataItem;
  handleFieldsChange: (field: FieldMultiSelectValue | string) => void;
  readonly: boolean;
  defaultFields: string[] | undefined | null;
  actionType: 'UPDATE_RECORD' | 'UPSERT_RECORD';
  hint?: string;
}) => {
  const { getIcon } = useIcons();

  const inlineFieldMetadataItems = objectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({
        fieldMetadataItem,
        actionType,
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
      options={inlineFieldDefinitions.map((field) => {
        const isIdField = field.metadata.fieldName === 'id';

        if (isIdField && actionType === 'UPSERT_RECORD') {
          return {
            label: 'ID',
            value: field.metadata.fieldName,
            Icon: getIcon('IconId'),
            color: 'gray',
          };
        }

        const isFieldRelationManyToOne =
          isFieldRelation(field) &&
          field.metadata.relationType === RelationType.MANY_TO_ONE;

        const value = isFieldRelationManyToOne
          ? `${field.metadata.fieldName}Id`
          : field.metadata.fieldName;

        return {
          label: field.label,
          value,
          Icon: getIcon(field.iconName),
          color: 'gray',
        };
      })}
      onChange={handleFieldsChange}
      placeholder={placeholder}
      readonly={readonly}
      hint={hint}
    />
  );
};
