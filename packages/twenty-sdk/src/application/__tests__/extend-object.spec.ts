import { extendObject } from '@/application/objects/extend-object';
import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectExtensionManifest } from 'twenty-shared/application';

describe('extendObject', () => {
  const validConfigByName: ObjectExtensionManifest = {
    targetObject: {
      nameSingular: 'company',
    },
    fields: [
      {
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
        type: FieldMetadataType.NUMBER,
        name: 'healthScore',
        label: 'Health Score',
      },
    ],
  };

  const validConfigByUniversalId: ObjectExtensionManifest = {
    targetObject: {
      universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
    },
    fields: [
      {
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440002',
        type: FieldMetadataType.TEXT,
        name: 'customNote',
        label: 'Custom Note',
      },
    ],
  };

  describe('valid configurations', () => {
    it('should return the config when targeting by nameSingular', () => {
      const result = extendObject(validConfigByName);

      expect(result).toEqual(validConfigByName);
    });

    it('should return the config when targeting by universalIdentifier', () => {
      const result = extendObject(validConfigByUniversalId);

      expect(result).toEqual(validConfigByUniversalId);
    });

    it('should pass through optional field properties', () => {
      const config: ObjectExtensionManifest = {
        ...validConfigByName,
        fields: [
          {
            ...validConfigByName.fields[0],
            description: 'A health score from 0-100',
            icon: 'IconHeart',
          },
        ],
      };

      const result = extendObject(config);

      expect(result.fields[0].description).toBe('A health score from 0-100');
      expect(result.fields[0].icon).toBe('IconHeart');
    });

    it('should accept SELECT field with options', () => {
      const config: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
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
          },
        ],
      };

      const result = extendObject(config);

      expect(result.fields[0].label).toBe('Churn Risk');
    });

    it('should accept multiple fields', () => {
      const config: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'person',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440004',
            type: FieldMetadataType.NUMBER,
            name: 'score',
            label: 'Score',
          },
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440005',
            type: FieldMetadataType.TEXT,
            name: 'notes',
            label: 'Notes',
          },
        ],
      };

      const result = extendObject(config);

      expect(result.fields).toHaveLength(2);
    });
  });

  describe('targetObject validation', () => {
    it('should throw error when targetObject is missing', () => {
      const config = {
        fields: validConfigByName.fields,
      };

      expect(() => extendObject(config as any)).toThrow(
        'Object extension must have a targetObject',
      );
    });

    it('should throw error when targetObject has neither nameSingular nor universalIdentifier', () => {
      const config = {
        targetObject: {},
        fields: validConfigByName.fields,
      };

      expect(() => extendObject(config as any)).toThrow(
        'targetObject must have either nameSingular or universalIdentifier',
      );
    });

    it('should throw error when targetObject has both nameSingular and universalIdentifier', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
          universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        },
        fields: validConfigByName.fields,
      };

      expect(() => extendObject(config as any)).toThrow(
        'targetObject cannot have both nameSingular and universalIdentifier',
      );
    });
  });

  describe('fields validation', () => {
    it('should throw error when fields is missing', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
      };

      expect(() => extendObject(config as any)).toThrow(
        'Object extension must have at least one field',
      );
    });

    it('should throw error when fields is empty', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Object extension must have at least one field',
      );
    });

    it('should throw error when field is missing label', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.NUMBER,
            name: 'healthScore',
          },
        ],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Field must have a label',
      );
    });

    it('should throw error when field is missing name', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.NUMBER,
            label: 'Health Score',
          },
        ],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Field "Health Score" must have a name',
      );
    });

    it('should throw error when field is missing universalIdentifier', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            type: FieldMetadataType.NUMBER,
            name: 'healthScore',
            label: 'Health Score',
          },
        ],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Field "Health Score" must have a universalIdentifier',
      );
    });

    it('should throw error when SELECT field has no options', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.SELECT,
            name: 'status',
            label: 'Status',
          },
        ],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Field "Status" is a SELECT/MULTI_SELECT type and must have options',
      );
    });

    it('should throw error when MULTI_SELECT field has no options', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.MULTI_SELECT,
            name: 'tags',
            label: 'Tags',
          },
        ],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Field "Tags" is a SELECT/MULTI_SELECT type and must have options',
      );
    });

    it('should throw error when SELECT field has empty options array', () => {
      const config = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.SELECT,
            name: 'status',
            label: 'Status',
            options: [],
          },
        ],
      };

      expect(() => extendObject(config as any)).toThrow(
        'Field "Status" is a SELECT/MULTI_SELECT type and must have options',
      );
    });
  });
});
