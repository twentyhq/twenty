import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';

describe('getJoinColumnName', () => {
  it('should return undefined for undefined settings', () => {
    expect(getJoinColumnName(undefined)).toBeUndefined();
  });

  it('should return undefined for null settings', () => {
    expect(getJoinColumnName(null as unknown as undefined)).toBeUndefined();
  });

  it('should return undefined for non-object settings', () => {
    expect(getJoinColumnName('string' as unknown as undefined)).toBeUndefined();
  });

  it('should return undefined for settings without joinColumnName', () => {
    expect(getJoinColumnName({})).toBeUndefined();
  });

  it('should return undefined for settings with non-string joinColumnName', () => {
    expect(getJoinColumnName({ joinColumnName: 123 })).toBeUndefined();
  });

  it('should return the joinColumnName for valid settings', () => {
    expect(getJoinColumnName({ joinColumnName: 'personId' })).toBe('personId');
    expect(getJoinColumnName({ joinColumnName: 'companyId' })).toBe(
      'companyId',
    );
  });
});
