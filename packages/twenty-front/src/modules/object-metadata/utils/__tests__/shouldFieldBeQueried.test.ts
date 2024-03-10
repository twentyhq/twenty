import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('shouldFieldBeQueried', () => {
  describe('if field is not relation', () => {
    it('should be queried if depth is undefined', () => {
      const res = shouldFieldBeQueried({
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(true);
    });

    it('should be queried depth = 0', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(true);
    });

    it('should be queried depth > 0', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(true);
    });

    it('should NOT be queried depth < 0', () => {
      const res = shouldFieldBeQueried({
        depth: -1,
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(false);
    });

    it('should not depends on eagerLoadedRelation', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        eagerLoadedRelations: {
          fieldName: true,
        },
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(true);
    });
  });

  describe('if field is relation', () => {
    it('should be queried if eagerLoadedRelation and depth are undefined', () => {
      const res = shouldFieldBeQueried({
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should be queried if eagerLoadedRelation is undefined and depth = 1', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should be queried if eagerLoadedRelation is undefined and depth > 1', () => {
      const res = shouldFieldBeQueried({
        depth: 2,
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should NOT be queried if eagerLoadedRelation is undefined and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should be queried if eagerLoadedRelation is matching and depth > 1', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        eagerLoadedRelations: { fieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should NOT be queried if eagerLoadedRelation is matching and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        eagerLoadedRelations: { fieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should NOT be queried if eagerLoadedRelation is not matching (falsy) and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        eagerLoadedRelations: { fieldName: false },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should NOT be queried if eagerLoadedRelation is not matching and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        eagerLoadedRelations: { anotherFieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });
  });
});
