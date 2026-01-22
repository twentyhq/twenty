import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';

describe('hasJunctionConfig', () => {
  it('should return false for undefined settings', () => {
    expect(hasJunctionConfig(undefined)).toBe(false);
  });

  it('should return false for settings without junctionTargetFieldId', () => {
    expect(hasJunctionConfig({})).toBe(false);
  });

  it('should return false for settings with empty junctionTargetFieldId', () => {
    expect(hasJunctionConfig({ junctionTargetFieldId: '' })).toBe(false);
  });

  it('should return true for settings with valid junctionTargetFieldId', () => {
    expect(hasJunctionConfig({ junctionTargetFieldId: 'field-id' })).toBe(true);
  });
});
