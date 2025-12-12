import { getUpdateManyRecordsMutationResponseField } from '../getUpdateManyRecordsMutationResponseField';

describe('getUpdateManyRecordsMutationResponseField', () => {
  it('should work', () => {
    expect(getUpdateManyRecordsMutationResponseField('companies')).toBe('updateCompanies');
  });
});
