import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { getMatchingRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getMatchingRecordFieldDisplayOverrides';

const COMPANY_OWNER_OVERRIDE: RecordFieldDisplayOverride = {
  objectNameSingular: 'company',
  fieldName: 'owner',
  recordGqlFields: { ownerExternalId: true },
  DisplayComponent: jest.fn(),
};

describe('getMatchingRecordFieldDisplayOverrides', () => {
  it('should return the override of a displayed field', () => {
    expect(
      getMatchingRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'company',
        fieldNames: ['name', 'owner'],
      }),
    ).toEqual([COMPANY_OWNER_OVERRIDE]);
  });

  it('should return nothing for a field without override', () => {
    expect(
      getMatchingRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'company',
        fieldNames: ['name'],
      }),
    ).toEqual([]);
  });

  it('should return nothing for the same field name on another object', () => {
    expect(
      getMatchingRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'opportunity',
        fieldNames: ['owner'],
      }),
    ).toEqual([]);
  });

  it('should return nothing without overrides', () => {
    expect(
      getMatchingRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [],
        objectNameSingular: 'company',
        fieldNames: ['owner'],
      }),
    ).toEqual([]);
  });
});
