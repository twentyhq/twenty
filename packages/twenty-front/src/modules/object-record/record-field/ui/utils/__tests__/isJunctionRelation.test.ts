import {
  hasJunctionConfig,
  hasJunctionMorphId,
  hasJunctionTargetRelationFieldIds,
} from '@/object-record/record-field/ui/utils/isJunctionRelation';

describe('isJunctionRelation', () => {
  describe('hasJunctionTargetRelationFieldIds', () => {
    it('should return false for undefined settings', () => {
      expect(hasJunctionTargetRelationFieldIds(undefined)).toBe(false);
    });

    it('should return false for null settings', () => {
      expect(hasJunctionTargetRelationFieldIds(null)).toBe(false);
    });

    it('should return false when junctionTargetRelationFieldIds is not present', () => {
      expect(hasJunctionTargetRelationFieldIds({})).toBe(false);
    });

    it('should return false when junctionTargetRelationFieldIds is empty array', () => {
      expect(
        hasJunctionTargetRelationFieldIds({
          junctionTargetRelationFieldIds: [],
        }),
      ).toBe(false);
    });

    it('should return true when junctionTargetRelationFieldIds has values', () => {
      const result = hasJunctionTargetRelationFieldIds({
        junctionTargetRelationFieldIds: ['field-id-1', 'field-id-2'],
      });
      expect(result).toBe(true);
    });

    it('should narrow type correctly', () => {
      const settings = {
        junctionTargetRelationFieldIds: ['field-id-1'],
      };
      if (hasJunctionTargetRelationFieldIds(settings)) {
        expect(settings.junctionTargetRelationFieldIds[0]).toBe('field-id-1');
      }
    });
  });

  describe('hasJunctionMorphId', () => {
    it('should return false for undefined settings', () => {
      expect(hasJunctionMorphId(undefined)).toBe(false);
    });

    it('should return false for null settings', () => {
      expect(hasJunctionMorphId(null)).toBe(false);
    });

    it('should return false when junctionMorphId is not present', () => {
      expect(hasJunctionMorphId({})).toBe(false);
    });

    it('should return false when junctionMorphId is empty string', () => {
      expect(hasJunctionMorphId({ junctionMorphId: '' })).toBe(false);
    });

    it('should return true when junctionMorphId has value', () => {
      const result = hasJunctionMorphId({
        junctionMorphId: 'morph-id-123',
      });
      expect(result).toBe(true);
    });

    it('should narrow type correctly', () => {
      const settings = { junctionMorphId: 'morph-id-123' };
      if (hasJunctionMorphId(settings)) {
        expect(settings.junctionMorphId).toBe('morph-id-123');
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

    it('should return true when junctionTargetRelationFieldIds is set', () => {
      expect(
        hasJunctionConfig({
          junctionTargetRelationFieldIds: ['field-id-1'],
        }),
      ).toBe(true);
    });

    it('should return true when junctionMorphId is set', () => {
      expect(
        hasJunctionConfig({
          junctionMorphId: 'morph-id-123',
        }),
      ).toBe(true);
    });

    it('should return true when both are set (even though invalid)', () => {
      expect(
        hasJunctionConfig({
          junctionTargetRelationFieldIds: ['field-id-1'],
          junctionMorphId: 'morph-id-123',
        }),
      ).toBe(true);
    });
  });
});

