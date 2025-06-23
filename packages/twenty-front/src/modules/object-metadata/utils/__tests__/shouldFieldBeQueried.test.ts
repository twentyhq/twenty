import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

describe('shouldFieldBeQueried', () => {
  describe('if recordGqlFields is absent, we query all except relations', () => {
    it('should be queried if the field is not a relation', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: { name: 'fieldName', type: FieldMetadataType.BOOLEAN },
      });
      expect(res).toBe(true);
    });

    it('should not be queried if the field is a relation ONE_TO_MANY', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: {
          name: 'fieldName',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
      });
      expect(res).toBe(false);
    });

    it('should not be queried if the field is a relation MANY_TO_ONE', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: {
          name: 'fieldName',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'fieldNameId',
          },
        },
      });
      expect(res).toBe(false);
    });

    it('should be queried if the field is a relation MANY_TO_ONE and is the joinColumnName', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldNameId',
        fieldMetadata: {
          name: 'fieldNameId',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'fieldNameId',
          },
        },
      });
      expect(res).toBe(true);
    });
  });

  describe('if recordGqlFields is present, we respect it', () => {
    it('should be queried if true', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: {
          name: 'fieldName',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        recordGqlFields: { fieldName: true },
      });
      expect(res).toBe(true);
    });

    it('should be queried if object', () => {
      const res = shouldFieldBeQueried({
        recordGqlFields: { fieldName: { subFieldName: false } },
        fieldMetadata: {
          name: 'fieldName',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        gqlField: 'fieldName',
      });
      expect(res).toBe(true);
    });

    it('should not be queried if false', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: {
          name: 'fieldName',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        recordGqlFields: { fieldName: false },
      });
      expect(res).toBe(false);
    });

    it('should not be queried if absent', () => {
      const res = shouldFieldBeQueried({
        gqlField: 'fieldName',
        fieldMetadata: {
          name: 'fieldName',
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        recordGqlFields: { otherFieldName: false },
      });
      expect(res).toBe(false);
    });
  });
});
