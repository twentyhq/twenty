import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';

describe('getUpdateOneRecordMutationResponseField', () => {
  it('should capitalize and prefix with "update"', () => {
    expect(getUpdateOneRecordMutationResponseField('person')).toBe(
      'updatePerson',
    );
  });

  it('should handle multi-word object names', () => {
    expect(getUpdateOneRecordMutationResponseField('company')).toBe(
      'updateCompany',
    );
  });

  it('should handle already capitalized names', () => {
    expect(getUpdateOneRecordMutationResponseField('Person')).toBe(
      'updatePerson',
    );
  });
});
