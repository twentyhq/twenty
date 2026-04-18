import { defineField } from '@/sdk/define';
import { FieldMetadataType } from 'twenty-shared/types';
import { type FieldManifest } from 'twenty-shared/application';

const validConfig: FieldManifest = {
  objectUniversalIdentifier: '45e8ae95-0ed8-4087-9f59-3ac85144f86d',
  universalIdentifier: '73068741-1638-4d40-b30c-3431a8733094',
  type: FieldMetadataType.TEXT,
  name: 'customNote',
  label: 'Custom Note',
};

describe('defineField', () => {
  describe('valid configurations', () => {
    it('should return successful validation result when targeting by nameSingular', () => {
      const result = defineField(validConfig);

      expect(result.success).toBe(true);
      expect(result.config).toEqual(validConfig);
      expect(result.errors).toEqual([]);
    });

    it('should pass through optional field properties', () => {
      const config: FieldManifest = {
        ...validConfig,

        description: 'A health score from 0-100',
        icon: 'IconHeart',
      };

      const result = defineField(config);

      expect(result.success).toBe(true);
      expect(result.config?.description).toBe('A health score from 0-100');
      expect(result.config?.icon).toBe('IconHeart');
    });

    it('should accept SELECT field with options', () => {
      const config: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440003',
        type: FieldMetadataType.SELECT,
        name: 'churnRisk',
        label: 'Churn Risk',
        options: [
          { value: 'low', label: 'Low', color: 'green', position: 0 },
          {
            value: 'medium',
            label: 'Medium',
            color: 'yellow',
            position: 1,
          },
          { value: 'high', label: 'High', color: 'red', position: 2 },
        ],
      };

      const result = defineField(config);

      expect(result.success).toBe(true);
      expect(result.config?.label).toBe('Churn Risk');
    });
  });

  it('should return error when objectUniversalIdentifier is missing', () => {
    const { objectUniversalIdentifier: _, ...validConfigWithoutTargetObject } =
      validConfig;

    const result = defineField(validConfigWithoutTargetObject as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Field must have an objectUniversalIdentifier',
    );
  });

  describe('fields validation', () => {
    it('should return error when field is missing label', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.NUMBER,
        name: 'healthScore',
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Field must have a label');
    });

    it('should return error when field is missing name', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.NUMBER,
        label: 'Health Score',
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Field "Health Score" must have a name');
    });

    it('should return error when field is missing universalIdentifier', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

        type: FieldMetadataType.NUMBER,
        name: 'healthScore',
        label: 'Health Score',
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Field "Health Score" must have a universalIdentifier',
      );
    });

    it('should return error when SELECT field has no options', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.SELECT,
        name: 'status',
        label: 'Status',
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Field "Status" is a SELECT/MULTI_SELECT type and must have options',
      );
    });

    it('should return error when MULTI_SELECT field has no options', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tags',
        label: 'Tags',
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Field "Tags" is a SELECT/MULTI_SELECT type and must have options',
      );
    });

    it('should return error when SELECT field has empty options array', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.SELECT,
        name: 'status',
        label: 'Status',
        options: [],
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Field "Status" is a SELECT/MULTI_SELECT type and must have options',
      );
    });

    it('should accept isUnique on a TEXT field', () => {
      const config: FieldManifest = {
        ...validConfig,
        isUnique: true,
      };

      const result = defineField(config);

      expect(result.success).toBe(true);
      expect(result.config?.isUnique).toBe(true);
    });

    it('should return error when isUnique is set on a RELATION field', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.RELATION,
        name: 'company',
        label: 'Company',
        isUnique: true,
        relationTargetFieldMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440002',
        relationTargetObjectMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440003',
        universalSettings: { relationType: 'ONE_TO_MANY' },
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        `Field "Company" of type ${FieldMetadataType.RELATION} cannot be unique`,
      );
    });

    it('should return error when isUnique is set on a FILES field', () => {
      const config = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.FILES,
        name: 'attachments',
        label: 'Attachments',
        isUnique: true,
      };

      const result = defineField(config as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        `Field "Attachments" of type ${FieldMetadataType.FILES} cannot be unique`,
      );
    });
  });
});
