import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { getFieldValueSourceDefinition } from '@/object-record/record-field/ui/utils/getFieldValueSourceDefinition';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD: CoreRecordReferenceField = {
  objectNameSingular: 'company',
  fieldName: 'owner',
  coreRecordIdFieldName: 'coreOwnerId',
  CoreRecordDisplay: jest.fn(),
};

const OWNER_FIELD_DEFINITION = {
  type: FieldMetadataType.RELATION,
  metadata: { fieldName: 'owner', objectMetadataNameSingular: 'company' },
};

describe('getFieldValueSourceDefinition', () => {
  it('should read a core record reference field from its core record id field', () => {
    expect(
      getFieldValueSourceDefinition({
        fieldDefinition: OWNER_FIELD_DEFINITION,
        coreRecordReferenceFields: [COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD],
      }),
    ).toEqual({
      type: FieldMetadataType.UUID,
      metadata: { fieldName: 'coreOwnerId' },
    });
  });

  it('should consider a core record reference field filled when its core record id is set, even without workspace relation', () => {
    const fieldValueSourceDefinition = getFieldValueSourceDefinition({
      fieldDefinition: OWNER_FIELD_DEFINITION,
      coreRecordReferenceFields: [COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD],
    });

    const company: Record<string, unknown> = {
      owner: null,
      coreOwnerId: '20202020-0000-4000-8000-000000000002',
    };

    expect(
      isFieldValueEmpty({
        fieldDefinition: fieldValueSourceDefinition,
        fieldValue: company[fieldValueSourceDefinition.metadata.fieldName],
      }),
    ).toBe(false);
  });

  it('should keep reading other fields from themselves', () => {
    expect(
      getFieldValueSourceDefinition({
        fieldDefinition: OWNER_FIELD_DEFINITION,
        coreRecordReferenceFields: [],
      }),
    ).toBe(OWNER_FIELD_DEFINITION);
  });
});
