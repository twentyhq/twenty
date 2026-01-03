import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/extractTargetRecordsFromJunction';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const createMockRelation = (
  targetObjectId: string,
  targetObjectName: string,
): FieldMetadataItemRelation => ({
  type: RelationType.MANY_TO_ONE,
  sourceFieldMetadata: { id: 'source-field-id', name: 'sourceField' },
  targetFieldMetadata: {
    id: 'target-field-id',
    name: 'targetField',
    isCustom: false,
  },
  sourceObjectMetadata: {
    id: 'source-object-id',
    nameSingular: 'sourceObject',
    namePlural: 'sourceObjects',
  },
  targetObjectMetadata: {
    id: targetObjectId,
    nameSingular: targetObjectName,
    namePlural: `${targetObjectName}s`,
  },
});

const mockObjectMetadataItems: ObjectMetadataItem[] = [
  {
    id: 'company-metadata-id',
    nameSingular: 'company',
    namePlural: 'companies',
  } as ObjectMetadataItem,
  {
    id: 'person-metadata-id',
    nameSingular: 'person',
    namePlural: 'people',
  } as ObjectMetadataItem,
];

const mockTargetField: FieldMetadataItem = {
  id: 'target-field-id',
  name: 'company',
  type: FieldMetadataType.RELATION,
  relation: createMockRelation('company-metadata-id', 'company'),
} as FieldMetadataItem;

const mockMorphFields: FieldMetadataItem[] = [
  {
    id: 'morph-field-company-id',
    name: 'company',
    morphId: 'morph-group-1',
    type: FieldMetadataType.MORPH_RELATION,
    relation: createMockRelation('company-metadata-id', 'company'),
  } as FieldMetadataItem,
  {
    id: 'morph-field-person-id',
    name: 'person',
    morphId: 'morph-group-1',
    type: FieldMetadataType.MORPH_RELATION,
    relation: createMockRelation('person-metadata-id', 'person'),
  } as FieldMetadataItem,
];

const createMockJunctionRecord = (
  id: string,
  targetData: Record<string, unknown>,
): ObjectRecord =>
  ({
    id,
    __typename: 'JunctionObject',
    ...targetData,
  }) as ObjectRecord;

describe('extractTargetRecordsFromJunction', () => {
  describe('with null/undefined junction records', () => {
    it('should return empty array for undefined junction records', () => {
      const result = extractTargetRecordsFromJunction({
        junctionRecords: undefined,
        targetField: mockTargetField,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
      });
      expect(result).toEqual([]);
    });

    it('should return empty array for null junction records', () => {
      const result = extractTargetRecordsFromJunction({
        junctionRecords: null,
        targetField: mockTargetField,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
      });
      expect(result).toEqual([]);
    });
  });

  describe('with regular relations', () => {
    it('should extract target records from junction records', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
        createMockJunctionRecord('junction-2', {
          company: { id: 'company-2', name: 'Beta Inc' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetField: mockTargetField,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
      });

      expect(result).toEqual([
        { recordId: 'company-1', objectMetadataId: 'company-metadata-id' },
        { recordId: 'company-2', objectMetadataId: 'company-metadata-id' },
      ]);
    });

    it('should include record when includeRecord is true', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetField: mockTargetField,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
        includeRecord: true,
      });

      expect(result).toEqual([
        {
          recordId: 'company-1',
          objectMetadataId: 'company-metadata-id',
          record: { id: 'company-1', name: 'Acme Corp' },
        },
      ]);
    });

    it('should skip junction records with null target', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', { company: null }),
        createMockJunctionRecord('junction-2', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetField: mockTargetField,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].recordId).toBe('company-1');
    });
  });

  describe('with morph relations', () => {
    it('should extract target records from different morph fields', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
        createMockJunctionRecord('junction-2', {
          person: { id: 'person-1', name: 'John Doe' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        morphFields: mockMorphFields,
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: true,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        recordId: 'company-1',
        objectMetadataId: 'company-metadata-id',
      });
      expect(result[1]).toEqual({
        recordId: 'person-1',
        objectMetadataId: 'person-metadata-id',
      });
    });

    it('should return correct object metadata for each morph field', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          person: { id: 'person-1', name: 'Jane Doe' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        morphFields: mockMorphFields,
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: true,
      });

      expect(result[0].objectMetadataId).toBe('person-metadata-id');
    });

    it('should include record when includeRecord is true for morph relations', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        morphFields: mockMorphFields,
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: true,
        includeRecord: true,
      });

      expect(result[0]).toEqual({
        recordId: 'company-1',
        objectMetadataId: 'company-metadata-id',
        record: { id: 'company-1', name: 'Acme Corp' },
      });
    });
  });

  describe('edge cases', () => {
    it('should skip undefined junction records in array', () => {
      const junctionRecords = [
        undefined as unknown as ObjectRecord,
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetField: mockTargetField,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
      });

      expect(result).toHaveLength(1);
    });

    it('should return empty for morph relations without morphFields', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        morphFields: undefined,
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: true,
      });

      expect(result).toEqual([]);
    });

    it('should return empty for regular relations without targetField', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetField: undefined,
        targetObjectMetadataId: 'company-metadata-id',
        objectMetadataItems: mockObjectMetadataItems,
        isMorphRelation: false,
      });

      expect(result).toEqual([]);
    });
  });
});
