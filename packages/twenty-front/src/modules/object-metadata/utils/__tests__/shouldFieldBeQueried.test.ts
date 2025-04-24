import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('shouldFieldBeQueried', () => {
  describe('if recordGqlFields is absent, we query all except relations', () => {
    it('should be queried if the field is not a relation', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.BOOLEAN },
      });
      expect(res).toBe(true);
    });

    it('should not be queried if the field is a relation', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.RELATION },
      });
      expect(res).toBe(false);
    });
  });

  describe('if recordGqlFields is present, we respect it', () => {
    it('should be queried if true', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.RELATION },
        recordGqlFields: { fieldName: true },
      });
      expect(res).toBe(true);
    });

    it('should be queried if object', () => {
      const res = shouldFieldBeQueried({
        recordGqlFields: { fieldName: { subFieldName: false } },
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.RELATION },
        gqlField: 'fieldName',
      });
      expect(res).toBe(true);
    });

    it('should not be queried if false', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.RELATION },
        recordGqlFields: { fieldName: false },
      });
      expect(res).toBe(false);
    });

    it('should not be queried if absent', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.RELATION },
        recordGqlFields: { otherFieldName: false },
      });
      expect(res).toBe(false);
    });
  });
});
