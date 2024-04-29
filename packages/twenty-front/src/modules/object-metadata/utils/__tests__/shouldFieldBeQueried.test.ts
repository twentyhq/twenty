import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('shouldFieldBeQueried', () => {
  describe('if recordGqlFields is absent, we query all except relations', () => {
    it('should be queried if the field is not a relation', () => {
      const res = shouldFieldBeQueried({
        field: { name: 'fieldName', type: FieldMetadataType.Boolean },
      });
      expect(res).toBe(true);
    });

    it('should not be queried if the field is a relation', () => {
      const res = shouldFieldBeQueried({
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });
  });

  describe('if recordGqlFields is present, we respect it', () => {
    it('should be queried if true', () => {
      const res = shouldFieldBeQueried({
        recordGqlFields: { fieldName: true },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should be queried if object', () => {
      const res = shouldFieldBeQueried({
        recordGqlFields: { fieldName: { subFieldName: false } },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(true);
    });

    it('should not be queried if false', () => {
      const res = shouldFieldBeQueried({
        recordGqlFields: { fieldName: false },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });

    it('should not be queried if absent', () => {
      const res = shouldFieldBeQueried({
        recordGqlFields: { otherFieldName: false },
        field: { name: 'fieldName', type: FieldMetadataType.Relation },
      });
      expect(res).toBe(false);
    });
  });
});
