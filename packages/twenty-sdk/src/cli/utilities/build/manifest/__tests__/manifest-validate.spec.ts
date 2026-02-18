import {
  type ApplicationManifest,
  type Manifest,
  type FieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';

const validApplication: ApplicationManifest = {
  universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
  displayName: 'Test App',
  description: 'Test app for Twenty',
  defaultRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
  packageJsonChecksum: '98592af7-4be9-4655-b5c4-9bef307a996c',
  yarnLockChecksum: '580ee05f-15fe-4146-bac2-6c382483c94e',
  apiClientChecksum: null,
};

const validField: FieldManifest = {
  objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

  universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
  type: FieldMetadataType.NUMBER,
  name: 'healthScore',
  label: 'Health Score',
};

const validManifest: Manifest = {
  application: validApplication,
  objects: [],
  frontComponents: [],
  fields: [],
  logicFunctions: [],
  roles: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
};

describe('manifestValidate', () => {
  describe('valid object extensions', () => {
    it('should pass validation with valid object extension by nameSingular', () => {
      const result = manifestValidate({
        ...validManifest,
        fields: [validField],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with valid object extension by universalIdentifier', () => {
      const extensionByUuid: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440002',
        type: FieldMetadataType.TEXT,
        name: 'customNote',
        label: 'Custom Note',
      };

      const result = manifestValidate({
        ...validManifest,
        fields: [extensionByUuid],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with multiple object extensions', () => {
      const anotherExtension: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440003',
        type: FieldMetadataType.TEXT,
        name: 'nickname',
        label: 'Nickname',
      };

      const result = manifestValidate({
        ...validManifest,
        fields: [validField, anotherExtension],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation with SELECT field having options', () => {
      const extensionWithSelect: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

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
      };
      const result = manifestValidate({
        ...validManifest,
        fields: [extensionWithSelect],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('duplicate universalIdentifier detection', () => {
    it('should fail when extension field has duplicate universalIdentifier', () => {
      const duplicateId = '550e8400-e29b-41d4-a716-446655440001';

      const fieldsWithDuplicates: FieldManifest[] = [
        {
          objectUniversalIdentifier: '91c5848c-36dc-4e7e-b9ee-aa78caeff5a8',
          universalIdentifier: duplicateId,
          type: FieldMetadataType.NUMBER,
          name: 'field1',
          label: 'Field 1',
        },
        {
          objectUniversalIdentifier: '97931020-123c-435b-ad97-9e19a5b38f1f',
          universalIdentifier: duplicateId,
          type: FieldMetadataType.TEXT,
          name: 'field2',
          label: 'Field 2',
        },
      ];

      const result = manifestValidate({
        ...validManifest,
        fields: fieldsWithDuplicates,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Duplicate universal identifiers: 550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result.warnings).toContain('No object defined');
      expect(result.warnings).toContain('No logic function defined');
      expect(result.warnings).toContain('No front component defined');
    });

    it('should fail when extension field ID conflicts with object field ID', () => {
      const sharedId = '550e8400-e29b-41d4-a716-446655440001';

      const result = manifestValidate({
        ...validManifest,
        objects: [
          {
            universalIdentifier: 'obj-uuid',
            nameSingular: 'myObject',
            namePlural: 'myObjects',
            labelSingular: 'My Object',
            labelPlural: 'My Objects',
            labelIdentifierFieldMetadataUniversalIdentifier: sharedId,
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
        fields: [
          {
            objectUniversalIdentifier: '91c5848c-36dc-4e7e-b9ee-aa78caeff5a8',
            universalIdentifier: sharedId,
            type: FieldMetadataType.NUMBER,
            name: 'extensionField',
            label: 'Extension Field',
          },
        ],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Duplicate universal identifiers: 550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result.warnings).not.toContain('No object defined');
      expect(result.warnings).toContain('No logic function defined');
      expect(result.warnings).toContain('No front component defined');
    });
  });
});
