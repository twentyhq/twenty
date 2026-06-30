import { getUpdateManyRecordsMutationResponseField } from '@/object-record/utils/getUpdateManyRecordsMutationResponseField';

describe('getUpdateManyRecordsMutationResponseField', () => {
  it('should work', () => {
    expect(getUpdateManyRecordsMutationResponseField('companies')).toBe(
      'updateCompanies',
    );
  });
});
