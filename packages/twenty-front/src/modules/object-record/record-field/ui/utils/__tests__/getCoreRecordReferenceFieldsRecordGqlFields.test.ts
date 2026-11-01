import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { getCoreRecordReferenceFieldsRecordGqlFields } from '@/object-record/record-field/ui/utils/getCoreRecordReferenceFieldsRecordGqlFields';

const CORE_RECORD_REFERENCE_FIELDS: CoreRecordReferenceField[] = [
  {
    objectNameSingular: 'company',
    fieldName: 'owner',
    coreRecordIdFieldName: 'coreOwnerId',
    CoreRecordDisplay: jest.fn(),
  },
  {
    objectNameSingular: 'company',
    fieldName: 'parent',
    coreRecordIdFieldName: 'coreParentId',
    CoreRecordDisplay: jest.fn(),
  },
];

describe('getCoreRecordReferenceFieldsRecordGqlFields', () => {
  it('should request the core record id fields of the requested fields', () => {
    expect(
      getCoreRecordReferenceFieldsRecordGqlFields({
        coreRecordReferenceFields: CORE_RECORD_REFERENCE_FIELDS,
        objectNameSingular: 'company',
        fieldNames: ['name', 'owner', 'parent'],
      }),
    ).toEqual({ coreOwnerId: true, coreParentId: true });
  });

  it('should only request the core record id fields of requested fields', () => {
    expect(
      getCoreRecordReferenceFieldsRecordGqlFields({
        coreRecordReferenceFields: CORE_RECORD_REFERENCE_FIELDS,
        objectNameSingular: 'company',
        fieldNames: ['owner'],
      }),
    ).toEqual({ coreOwnerId: true });
  });

  it('should request nothing more for another object', () => {
    expect(
      getCoreRecordReferenceFieldsRecordGqlFields({
        coreRecordReferenceFields: CORE_RECORD_REFERENCE_FIELDS,
        objectNameSingular: 'opportunity',
        fieldNames: ['owner', 'parent'],
      }),
    ).toEqual({});
  });
});
