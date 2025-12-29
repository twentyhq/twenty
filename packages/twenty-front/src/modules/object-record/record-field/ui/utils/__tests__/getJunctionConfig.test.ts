import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/getJunctionConfig';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const createMockRelation = (
  targetObjectId: string,
  targetObjectName: string,
  type: RelationType = RelationType.MANY_TO_ONE,
): FieldMetadataItemRelation => ({
  type,
  sourceFieldMetadata: { id: 'source-field-id', name: 'sourceField' },
  targetFieldMetadata: { id: 'target-field-id', name: 'targetField', isCustom: false },
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

const createMockField = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem =>
  ({
    id: 'default-field-id',
    name: 'defaultField',
    type: FieldMetadataType.RELATION,
    ...overrides,
  }) as FieldMetadataItem;

const createMockObjectMetadata = (
  overrides: Partial<ObjectMetadataItem>,
): ObjectMetadataItem =>
  ({
    id: 'default-object-id',
    nameSingular: 'defaultObject',
    namePlural: 'defaultObjects',
    fields: [],
    ...overrides,
  }) as ObjectMetadataItem;

describe('getJunctionConfig', () => {
  describe('basic scenarios', () => {
    it('should return null when junction object metadata not found', () => {
      const result = getJunctionConfig({
        settings: { junctionTargetRelationFieldIds: ['field-id'] },
        relationObjectMetadataId: 'non-existent-id',
        objectMetadataItems: [],
      });
      expect(result).toBeNull();
    });

    it('should return null when settings has no junction config', () => {
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [],
      });

      const result = getJunctionConfig({
        settings: {},
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });
      expect(result).toBeNull();
    });

    it('should return null when settings is undefined', () => {
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
      });

      const result = getJunctionConfig({
        settings: undefined,
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });
      expect(result).toBeNull();
    });
  });

  describe('junctionMorphId configuration', () => {
    it('should return morphFields when junctionMorphId is set', () => {
      const morphField1 = createMockField({
        id: 'morph-field-1',
        name: 'company',
        morphId: 'morph-group-1',
        type: FieldMetadataType.MORPH_RELATION,
        relation: createMockRelation('company-id', 'company'),
      });
      const morphField2 = createMockField({
        id: 'morph-field-2',
        name: 'person',
        morphId: 'morph-group-1',
        type: FieldMetadataType.MORPH_RELATION,
        relation: createMockRelation('person-id', 'person'),
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [morphField1, morphField2],
      });

      const result = getJunctionConfig({
        settings: { junctionMorphId: 'morph-group-1' },
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).not.toBeNull();
      expect(result!.isMorphRelation).toBe(true);
      expect(result!.morphFields).toHaveLength(2);
      expect(result!.morphFields![0].name).toBe('company');
      expect(result!.morphFields![1].name).toBe('person');
    });

    it('should return null when no fields match the morphId', () => {
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [
          createMockField({
            id: 'other-field',
            morphId: 'different-morph-id',
          }),
        ],
      });

      const result = getJunctionConfig({
        settings: { junctionMorphId: 'morph-group-1' },
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).toBeNull();
    });

    it('should find sourceField when sourceObjectMetadataId is provided', () => {
      const sourceField = createMockField({
        id: 'source-field',
        name: 'project',
        type: FieldMetadataType.RELATION,
        relation: createMockRelation('source-object-id', 'project'),
      });
      const morphField = createMockField({
        id: 'morph-field-1',
        name: 'company',
        morphId: 'morph-group-1',
        type: FieldMetadataType.MORPH_RELATION,
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [sourceField, morphField],
      });

      const result = getJunctionConfig({
        settings: { junctionMorphId: 'morph-group-1' },
        relationObjectMetadataId: 'junction-id',
        sourceObjectMetadataId: 'source-object-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).not.toBeNull();
      expect(result!.sourceField).toBeDefined();
      expect(result!.sourceField!.name).toBe('project');
    });
  });

  describe('junctionTargetRelationFieldIds configuration', () => {
    it('should return targetField for regular relation', () => {
      const targetField = createMockField({
        id: 'target-field-id',
        name: 'company',
        type: FieldMetadataType.RELATION,
        relation: createMockRelation('company-metadata-id', 'company'),
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [targetField],
      });
      const companyObject = createMockObjectMetadata({
        id: 'company-metadata-id',
        nameSingular: 'company',
      });

      const result = getJunctionConfig({
        settings: { junctionTargetRelationFieldIds: ['target-field-id'] },
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject, companyObject],
      });

      expect(result).not.toBeNull();
      expect(result!.isMorphRelation).toBe(false);
      expect(result!.targetField).toBeDefined();
      expect(result!.targetField!.name).toBe('company');
      expect(result!.targetObjectMetadata!.nameSingular).toBe('company');
    });

    it('should return null when target field not found', () => {
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [],
      });

      const result = getJunctionConfig({
        settings: { junctionTargetRelationFieldIds: ['non-existent-field'] },
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).toBeNull();
    });

    it('should return null for regular relation without relation property', () => {
      const targetField = createMockField({
        id: 'target-field-id',
        name: 'company',
        type: FieldMetadataType.RELATION,
        relation: undefined,
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [targetField],
      });

      const result = getJunctionConfig({
        settings: { junctionTargetRelationFieldIds: ['target-field-id'] },
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).toBeNull();
    });

    it('should handle MORPH_RELATION field referenced by ID', () => {
      const morphField = createMockField({
        id: 'morph-field-id',
        name: 'linkedObject',
        type: FieldMetadataType.MORPH_RELATION,
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [morphField],
      });

      const result = getJunctionConfig({
        settings: { junctionTargetRelationFieldIds: ['morph-field-id'] },
        relationObjectMetadataId: 'junction-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).not.toBeNull();
      expect(result!.isMorphRelation).toBe(true);
      expect(result!.targetField!.name).toBe('linkedObject');
      expect(result!.targetObjectMetadata).toBeUndefined();
    });

    it('should find sourceField excluding the target field', () => {
      const sourceField = createMockField({
        id: 'source-field',
        name: 'project',
        type: FieldMetadataType.RELATION,
        relation: createMockRelation('source-object-id', 'project'),
      });
      const targetField = createMockField({
        id: 'target-field-id',
        name: 'company',
        type: FieldMetadataType.RELATION,
        relation: createMockRelation('company-metadata-id', 'company'),
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        fields: [sourceField, targetField],
      });

      const result = getJunctionConfig({
        settings: { junctionTargetRelationFieldIds: ['target-field-id'] },
        relationObjectMetadataId: 'junction-id',
        sourceObjectMetadataId: 'source-object-id',
        objectMetadataItems: [junctionObject],
      });

      expect(result).not.toBeNull();
      expect(result!.sourceField).toBeDefined();
      expect(result!.sourceField!.name).toBe('project');
    });
  });
});
