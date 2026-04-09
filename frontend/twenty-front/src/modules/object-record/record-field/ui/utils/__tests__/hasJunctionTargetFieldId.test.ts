import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';

describe('hasJunctionTargetFieldId', () => {
  it('should return false for undefined settings', () => {
    expect(hasJunctionTargetFieldId(undefined)).toBe(false);
  });

  it('should return false for null settings', () => {
    expect(hasJunctionTargetFieldId(null as unknown as undefined)).toBe(false);
  });

  it('should return false for non-object settings', () => {
    expect(hasJunctionTargetFieldId('string' as unknown as undefined)).toBe(
      false,
    );
  });

  it('should return false for settings without junctionTargetFieldId', () => {
    expect(hasJunctionTargetFieldId({})).toBe(false);
  });

  it('should return false for settings with non-string junctionTargetFieldId', () => {
    expect(hasJunctionTargetFieldId({ junctionTargetFieldId: 123 })).toBe(
      false,
    );
  });

  it('should return false for settings with empty string junctionTargetFieldId', () => {
    expect(hasJunctionTargetFieldId({ junctionTargetFieldId: '' })).toBe(false);
  });

  it('should return true for settings with valid junctionTargetFieldId', () => {
    expect(
      hasJunctionTargetFieldId({ junctionTargetFieldId: 'some-field-id' }),
    ).toBe(true);
  });
});
