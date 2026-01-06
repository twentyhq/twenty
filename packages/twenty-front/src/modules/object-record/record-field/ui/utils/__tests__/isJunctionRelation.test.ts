import {
  hasJunctionConfig,
  hasJunctionTargetFieldId,
  hasJunctionTargetMorphId,
} from '@/object-record/record-field/ui/utils/isJunctionRelation';

describe('isJunctionRelation', () => {
  describe('hasJunctionTargetFieldId', () => {
    it('should return false for undefined settings', () => {
      expect(hasJunctionTargetFieldId(undefined)).toBe(false);
    });

    it('should return false for null settings', () => {
      expect(hasJunctionTargetFieldId(null)).toBe(false);
    });

    it('should return false when junctionTargetFieldId is not present', () => {
      expect(hasJunctionTargetFieldId({})).toBe(false);
    });

    it('should return false when junctionTargetFieldId is empty string', () => {
      expect(
        hasJunctionTargetFieldId({
          junctionTargetFieldId: '',
        }),
      ).toBe(false);
    });

    it('should return true when junctionTargetFieldId has value', () => {
      const result = hasJunctionTargetFieldId({
        junctionTargetFieldId: 'field-id-1',
      });
      expect(result).toBe(true);
    });

    it('should narrow type correctly', () => {
      const settings = {
        junctionTargetFieldId: 'field-id-1',
      };
      if (hasJunctionTargetFieldId(settings)) {
        expect(settings.junctionTargetFieldId).toBe('field-id-1');
      }
    });
  });

  describe('hasJunctionTargetMorphId', () => {
    it('should return false for undefined settings', () => {
      expect(hasJunctionTargetMorphId(undefined)).toBe(false);
    });

    it('should return false for null settings', () => {
      expect(hasJunctionTargetMorphId(null)).toBe(false);
    });

    it('should return false when junctionTargetMorphId is not present', () => {
      expect(hasJunctionTargetMorphId({})).toBe(false);
    });

    it('should return false when junctionTargetMorphId is empty string', () => {
      expect(hasJunctionTargetMorphId({ junctionTargetMorphId: '' })).toBe(
        false,
      );
    });

    it('should return true when junctionTargetMorphId has value', () => {
      const result = hasJunctionTargetMorphId({
        junctionTargetMorphId: 'morph-id-123',
      });
      expect(result).toBe(true);
    });

    it('should narrow type correctly', () => {
      const settings = { junctionTargetMorphId: 'morph-id-123' };
      if (hasJunctionTargetMorphId(settings)) {
        expect(settings.junctionTargetMorphId).toBe('morph-id-123');
      }
    });
  });

  describe('hasJunctionConfig', () => {
    it('should return false for undefined settings', () => {
      expect(hasJunctionConfig(undefined)).toBe(false);
    });

    it('should return false for empty settings', () => {
      expect(hasJunctionConfig({})).toBe(false);
    });

    it('should return true when junctionTargetFieldId is set', () => {
      expect(
        hasJunctionConfig({
          junctionTargetFieldId: 'field-id-1',
        }),
      ).toBe(true);
    });

    it('should return true when junctionTargetMorphId is set', () => {
      expect(
        hasJunctionConfig({
          junctionTargetMorphId: 'morph-id-123',
        }),
      ).toBe(true);
    });

    it('should return true when both are set (even though invalid)', () => {
      expect(
        hasJunctionConfig({
          junctionTargetFieldId: 'field-id-1',
          junctionTargetMorphId: 'morph-id-123',
        }),
      ).toBe(true);
    });
  });
});
