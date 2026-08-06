import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';
import { RelationType } from '~/generated-metadata/graphql';

export type RelationManyToOneField = {
  id: string;
};

export type RecordActionFormData = {
  objectName: string;
  [field: string]: RelationManyToOneField | JsonValue;
};

export const buildUpdatedRecordActionFormData = <
  T extends RecordActionFormData,
>({
  formData,
  fieldName,
  fieldDefinition,
  updatedValue,
}: {
  formData: T;
  fieldName: keyof T;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  updatedValue: JsonValue;
}): T => {
  const isFieldRelationManyToOne =
    isFieldRelation(fieldDefinition) &&
    fieldDefinition.metadata.relationType === RelationType.MANY_TO_ONE;

  const updatedFormData: T = { ...formData };

  if (isFieldRelationManyToOne && !isDefined(updatedValue)) {
    delete updatedFormData[fieldName];

    return updatedFormData;
  }

  updatedFormData[fieldName] = (
    isFieldRelationManyToOne ? { id: updatedValue } : updatedValue
  ) as T[keyof T];

  return updatedFormData;
};
