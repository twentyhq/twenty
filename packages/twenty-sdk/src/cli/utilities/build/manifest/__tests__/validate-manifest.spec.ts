import { validateManifest } from '@/cli/utilities/build/manifest/manifest-validate';
import {
  type Application,
  type ObjectExtensionManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

describe('validateManifest - objectExtensions', () => {
  const validApplication: Application = {
    universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
    displayName: 'Test App',
    functionRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
  };

  const validObjectExtension: ObjectExtensionManifest = {
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

  describe('valid object extensions', () => {
    it('should pass validation with valid object extension by nameSingular', () => {
      const result = validateManifest({
        application: validApplication,
        objects: [],
        frontComponents: [],
        objectExtensions: [validObjectExtension],
        functions: [],
        roles: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with valid object extension by universalIdentifier', () => {
      const extensionByUuid: ObjectExtensionManifest = {
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

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [extensionByUuid],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with multiple object extensions', () => {
      const anotherExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'person',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440003',
            type: FieldMetadataType.TEXT,
            name: 'nickname',
            label: 'Nickname',
          },
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [validObjectExtension, anotherExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with SELECT field having options', () => {
      const extensionWithSelect: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440004',
            type: FieldMetadataType.SELECT,
            name: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active', color: 'green', position: 0 },
              {
                value: 'inactive',
                label: 'Inactive',
                color: 'red',
                position: 1,
              },
            ],
          },
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [extensionWithSelect],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('targetObject validation', () => {
    it('should fail when targetObject is missing', () => {
      const invalidExtension = {
        fields: validObjectExtension.fields,
      } as ObjectExtensionManifest;

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Object extension must have a targetObject',
        }),
      );
    });

    it('should fail when targetObject has neither nameSingular nor universalIdentifier', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {} as any,
        fields: validObjectExtension.fields,
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message:
            'Object extension targetObject must have either nameSingular or universalIdentifier',
        }),
      );
    });

    it('should fail when targetObject has both nameSingular and universalIdentifier', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
          universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        } as any,
        fields: validObjectExtension.fields,
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message:
            'Object extension targetObject cannot have both nameSingular and universalIdentifier',
        }),
      );
    });
  });

  describe('fields validation', () => {
    it('should fail when fields array is empty', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Object extension must have at least one field',
        }),
      );
    });

    it('should fail when field is missing universalIdentifier', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            type: FieldMetadataType.NUMBER,
            name: 'healthScore',
            label: 'Health Score',
          } as any,
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Field must have a universalIdentifier',
        }),
      );
    });

    it('should fail when field is missing type', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            name: 'healthScore',
            label: 'Health Score',
          } as any,
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Field must have a type',
        }),
      );
    });

    it('should fail when field is missing label', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.NUMBER,
            name: 'healthScore',
          } as any,
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Field must have a label',
        }),
      );
    });

    it('should fail when SELECT field has no options', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.SELECT,
            name: 'status',
            label: 'Status',
          } as any,
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'SELECT/MULTI_SELECT field must have options',
        }),
      );
    });

    it('should fail when MULTI_SELECT field has empty options', () => {
      const invalidExtension: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
            type: FieldMetadataType.MULTI_SELECT,
            name: 'tags',
            label: 'Tags',
            options: [],
          } as any,
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [invalidExtension],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'SELECT/MULTI_SELECT field must have options',
        }),
      );
    });
  });

  describe('duplicate universalIdentifier detection', () => {
    it('should fail when extension field has duplicate universalIdentifier', () => {
      const duplicateId = '550e8400-e29b-41d4-a716-446655440001';

      const extensionWithDuplicates: ObjectExtensionManifest = {
        targetObject: {
          nameSingular: 'company',
        },
        fields: [
          {
            universalIdentifier: duplicateId,
            type: FieldMetadataType.NUMBER,
            name: 'field1',
            label: 'Field 1',
          },
          {
            universalIdentifier: duplicateId, // Same ID!
            type: FieldMetadataType.TEXT,
            name: 'field2',
            label: 'Field 2',
          },
        ],
      };

      const result = validateManifest({
        application: validApplication,
        objects: [],
        objectExtensions: [extensionWithDuplicates],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Duplicate universalIdentifier'),
        }),
      );
    });

    it('should fail when extension field ID conflicts with object field ID', () => {
      const sharedId = '550e8400-e29b-41d4-a716-446655440001';

      const result = validateManifest({
        application: validApplication,
        objects: [
          {
            universalIdentifier: 'obj-uuid',
            nameSingular: 'myObject',
            namePlural: 'myObjects',
            labelSingular: 'My Object',
            labelPlural: 'My Objects',
            fields: [
              {
                universalIdentifier: sharedId,
                type: FieldMetadataType.TEXT,
                name: 'existingField',
                label: 'Existing Field',
              },
            ],
          },
        ],
        objectExtensions: [
          {
            targetObject: { nameSingular: 'company' },
            fields: [
              {
                universalIdentifier: sharedId, // Same as object field!
                type: FieldMetadataType.NUMBER,
                name: 'extensionField',
                label: 'Extension Field',
              },
            ],
          },
        ],
        functions: [],
        frontComponents: [],
        roles: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Duplicate universalIdentifier'),
        }),
      );
    });
  });
});
