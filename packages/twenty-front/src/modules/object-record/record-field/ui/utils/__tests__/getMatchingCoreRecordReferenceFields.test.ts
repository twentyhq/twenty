import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { getMatchingCoreRecordReferenceFields } from '@/object-record/record-field/ui/utils/getMatchingCoreRecordReferenceFields';

const COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD: CoreRecordReferenceField = {
  objectNameSingular: 'company',
  fieldName: 'owner',
  coreRecordIdFieldName: 'coreOwnerId',
  CoreRecordDisplay: jest.fn(),
};

describe('getMatchingCoreRecordReferenceFields', () => {
  it('should return the core record reference of a displayed field', () => {
    expect(
      getMatchingCoreRecordReferenceFields({
        coreRecordReferenceFields: [COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD],
        objectNameSingular: 'company',
        fieldNames: ['name', 'owner'],
      }),
    ).toEqual([COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD]);
  });

  it('should return nothing for a field without core record reference', () => {
    expect(
      getMatchingCoreRecordReferenceFields({
        coreRecordReferenceFields: [COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD],
        objectNameSingular: 'company',
        fieldNames: ['name'],
      }),
    ).toEqual([]);
  });

  it('should return nothing for the same field name on another object', () => {
    expect(
      getMatchingCoreRecordReferenceFields({
        coreRecordReferenceFields: [COMPANY_OWNER_CORE_RECORD_REFERENCE_FIELD],
        objectNameSingular: 'opportunity',
        fieldNames: ['owner'],
      }),
    ).toEqual([]);
  });

  it('should return nothing without core record references', () => {
    expect(
      getMatchingCoreRecordReferenceFields({
        coreRecordReferenceFields: [],
        objectNameSingular: 'company',
        fieldNames: ['owner'],
      }),
    ).toEqual([]);
  });
});
