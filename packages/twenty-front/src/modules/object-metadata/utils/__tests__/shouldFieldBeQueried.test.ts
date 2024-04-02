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

    it('should not depends on queryFields', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        queryFields: {
          fieldName: true,
        },
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(true);
    });
  });

  describe('if field is relation', () => {
    it('should be queried if queryFields and depth are undefined', () => {
      const res = shouldFieldBeQueried({
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should be queried if queryFields is undefined and depth = 1', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should be queried if queryFields is undefined and depth > 1', () => {
      const res = shouldFieldBeQueried({
        depth: 2,
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should NOT be queried if queryFields is undefined and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should be queried if queryFields is matching and depth > 1', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        queryFields: { fieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should NOT be queried if queryFields is matching and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        queryFields: { fieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should NOT be queried if queryFields is not matching (falsy) and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 1,
        queryFields: { fieldName: false },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should NOT be queried if queryFields is not matching and depth < 1', () => {
      const res = shouldFieldBeQueried({
        depth: 0,
        queryFields: { anotherFieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });
  });
});
