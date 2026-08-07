import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  buildUpdatedRecordActionFormData,
  type RecordActionFormData,
} from '@/workflow/workflow-steps/workflow-actions/utils/buildUpdatedRecordActionFormData';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const relationToOneFieldDefinition = {
  fieldMetadataId: 'field-metadata-id',
  label: 'Company',
  type: FieldMetadataType.RELATION,
  iconName: 'IconBuildingSkyscraper',
  metadata: {
    fieldName: 'company',
    relationType: RelationType.MANY_TO_ONE,
    objectMetadataNameSingular: 'person',
    relationObjectMetadataNameSingular: 'company',
    relationObjectMetadataNamePlural: 'companies',
  },
} as unknown as FieldDefinition<FieldMetadata>;

const textFieldDefinition = {
  fieldMetadataId: 'field-metadata-id',
  label: 'City',
  type: FieldMetadataType.TEXT,
  iconName: 'IconMap',
  metadata: {
    fieldName: 'city',
    objectMetadataNameSingular: 'person',
  },
} as unknown as FieldDefinition<FieldMetadata>;

const formData: RecordActionFormData = {
  objectName: 'person',
  city: 'Paris',
};

describe('buildUpdatedRecordActionFormData', () => {
  it('should wrap a selected record id in an object when the field is a to-one relation', () => {
    const result = buildUpdatedRecordActionFormData({
      formData,
      fieldName: 'company',
      fieldDefinition: relationToOneFieldDefinition,
      updatedValue: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
    });

    expect(result).toEqual({
      objectName: 'person',
      city: 'Paris',
      company: { id: '20202020-3ec3-4fe3-8997-b76aa0bfa408' },
    });
  });

  it('should wrap a variable in an object when the field is a to-one relation', () => {
    const result = buildUpdatedRecordActionFormData({
      formData,
      fieldName: 'company',
      fieldDefinition: relationToOneFieldDefinition,
      updatedValue: '{{trigger.object.id}}',
    });

    expect(result.company).toEqual({ id: '{{trigger.object.id}}' });
  });

  it('should remove the field when a to-one relation is cleared', () => {
    const result = buildUpdatedRecordActionFormData({
      formData: { ...formData, company: { id: 'previous-record-id' } },
      fieldName: 'company',
      fieldDefinition: relationToOneFieldDefinition,
      updatedValue: null,
    });

    expect(result).not.toHaveProperty('company');
    expect(result).toEqual({ objectName: 'person', city: 'Paris' });
  });

  it('should keep null values as-is when the field is not a relation', () => {
    const result = buildUpdatedRecordActionFormData({
      formData,
      fieldName: 'city',
      fieldDefinition: textFieldDefinition,
      updatedValue: null,
    });

    expect(result.city).toBeNull();
  });

  it('should not mutate the form data it receives', () => {
    const initialFormData: RecordActionFormData = {
      objectName: 'person',
      company: { id: 'previous-record-id' },
    };

    buildUpdatedRecordActionFormData({
      formData: initialFormData,
      fieldName: 'company',
      fieldDefinition: relationToOneFieldDefinition,
      updatedValue: null,
    });

    expect(initialFormData.company).toEqual({ id: 'previous-record-id' });
  });
});
