import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const createMockRelation = (
  targetObjectId: string,
  targetObjectName: string,
  sourceFieldName = 'sourceField',
): FieldMetadataItemRelation => ({
  type: RelationType.MANY_TO_ONE,
  sourceFieldMetadata: { id: 'source-field-id', name: sourceFieldName },
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

// Mock morph field with morphRelations (how real data looks)
const mockMorphFieldWithRelations: FieldMetadataItem = {
  id: 'morph-field-id',
  name: 'caretaker',
  morphId: 'morph-group-1',
  type: FieldMetadataType.MORPH_RELATION,
  morphRelations: [
    createMockRelation('company-metadata-id', 'company', 'caretaker'),
    createMockRelation('person-metadata-id', 'person', 'caretaker'),
  ],
} as FieldMetadataItem;

// Mock multiple regular relation fields (for multiple target testing)
const mockMultipleRelationFields: FieldMetadataItem[] = [
  {
    id: 'relation-field-company-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    relation: createMockRelation('company-metadata-id', 'company'),
  } as FieldMetadataItem,
  {
    id: 'relation-field-person-id',
    name: 'person',
    type: FieldMetadataType.RELATION,
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
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
      });
      expect(result).toEqual([]);
    });

    it('should return empty array for null junction records', () => {
      const result = extractTargetRecordsFromJunction({
        junctionRecords: null,
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
      });
      expect(result).toEqual([]);
    });

    it('should return empty array for empty targetFields', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields: [],
        objectMetadataItems: mockObjectMetadataItems,
      });
      expect(result).toEqual([]);
    });
  });

  describe('with single target field (regular relations)', () => {
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
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
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
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
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
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
      });

      expect(result).toHaveLength(1);
      expect(result[0].recordId).toBe('company-1');
    });
  });

  describe('with multiple target fields (multiple regular relations)', () => {
    it('should extract target records from different target fields', () => {
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
        targetFields: mockMultipleRelationFields,
        objectMetadataItems: mockObjectMetadataItems,
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

    it('should return correct object metadata for each target field', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          person: { id: 'person-1', name: 'Jane Doe' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields: mockMultipleRelationFields,
        objectMetadataItems: mockObjectMetadataItems,
      });

      expect(result[0].objectMetadataId).toBe('person-metadata-id');
    });

    it('should include record when includeRecord is true', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          company: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields: mockMultipleRelationFields,
        objectMetadataItems: mockObjectMetadataItems,
        includeRecord: true,
      });

      expect(result[0]).toEqual({
        recordId: 'company-1',
        objectMetadataId: 'company-metadata-id',
        record: { id: 'company-1', name: 'Acme Corp' },
      });
    });
  });

  describe('with morph relation field', () => {
    // MORPH_RELATION fields use computed field names like "caretakerCompany", "caretakerPerson"
    it('should extract target records from morph relation computed field names', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          caretakerCompany: { id: 'company-1', name: 'Acme Corp' },
        }),
        createMockJunctionRecord('junction-2', {
          caretakerPerson: { id: 'person-1', name: 'John Doe' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields: [mockMorphFieldWithRelations],
        objectMetadataItems: mockObjectMetadataItems,
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

    it('should include record when includeRecord is true for morph relations', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          caretakerCompany: { id: 'company-1', name: 'Acme Corp' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields: [mockMorphFieldWithRelations],
        objectMetadataItems: mockObjectMetadataItems,
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
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
      });

      expect(result).toHaveLength(1);
    });

    it('should return empty when no target field matches the junction record data', () => {
      const junctionRecords = [
        createMockJunctionRecord('junction-1', {
          unknownField: { id: 'record-1', name: 'Unknown' },
        }),
      ];

      const result = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields: [mockTargetField],
        objectMetadataItems: mockObjectMetadataItems,
      });

      expect(result).toEqual([]);
    });
  });
});
