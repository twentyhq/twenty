import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

export type RelationManyToOneField = {
  id: string;
};

export type RecordActionFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

export const buildUpdatedRecordActionFormData = ({
  formData,
  fieldName,
  fieldDefinition,
  updatedValue,
}: {
  formData: RecordActionFormData;
  fieldName: keyof RecordActionFormData;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  updatedValue: JsonValue;
}): RecordActionFormData => {
  const isRelationManyToOne = isFieldRelationManyToOne(fieldDefinition);

  const updatedFormData: RecordActionFormData = { ...formData };

  if (isRelationManyToOne && !isDefined(updatedValue)) {
    delete updatedFormData[fieldName];

    return updatedFormData;
  }

  updatedFormData[fieldName] = isRelationManyToOne
    ? { id: updatedValue }
    : updatedValue;

  return updatedFormData;
};
