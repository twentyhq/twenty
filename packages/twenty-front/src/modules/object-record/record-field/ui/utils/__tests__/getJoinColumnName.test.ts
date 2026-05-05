import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';

describe('getJoinColumnName', () => {
  it('should return undefined for undefined field', () => {
    expect(getJoinColumnName(undefined)).toBeUndefined();
  });

  it('should return undefined for null field', () => {
    expect(getJoinColumnName(null)).toBeUndefined();
  });

  it('should compute the join column name from the field name', () => {
    expect(getJoinColumnName({ name: 'person' })).toBe('personId');
    expect(getJoinColumnName({ name: 'company' })).toBe('companyId');
    expect(getJoinColumnName({ name: 'targetOpportunity' })).toBe(
      'targetOpportunityId',
    );
  });
});
