import { isFilterOnActorWorkspaceMemberSubField } from '../isFilterOnActorWorkspaceMemberSubField';

describe('isFilterOnActorWorkspaceMemberSubField', () => {
  it('should return true when subFieldName is "workspaceMemberId"', () => {
    expect(isFilterOnActorWorkspaceMemberSubField('workspaceMemberId')).toBe(
      true,
    );
  });

  it('should return false when subFieldName is "source"', () => {
    expect(isFilterOnActorWorkspaceMemberSubField('source')).toBe(false);
  });

  it('should return false when subFieldName is "name"', () => {
    expect(isFilterOnActorWorkspaceMemberSubField('name')).toBe(false);
  });

  it('should return false when subFieldName is undefined', () => {
    expect(isFilterOnActorWorkspaceMemberSubField(undefined)).toBe(false);
  });

  it('should return false when subFieldName is null', () => {
    expect(isFilterOnActorWorkspaceMemberSubField(null)).toBe(false);
  });

  it('should return false when subFieldName is an empty string', () => {
    expect(isFilterOnActorWorkspaceMemberSubField('')).toBe(false);
  });

  it('should return false for arbitrary string values', () => {
    expect(isFilterOnActorWorkspaceMemberSubField('someOtherField')).toBe(
      false,
    );
  });
});
