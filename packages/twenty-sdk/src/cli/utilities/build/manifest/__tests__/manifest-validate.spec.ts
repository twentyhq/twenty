import {
  type ApplicationManifest,
  type FieldManifest,
  type Manifest,
} from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';

const validApplication: ApplicationManifest = {
  universalIdentifier: '8e8ee827-5a0b-46b0-bb63-c13ccd734ac6',
  displayName: 'Test App',
  description: 'Test app for Twenty',
  defaultRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
  packageJsonChecksum: '98592af7-4be9-4655-b5c4-9bef307a996c',
  yarnLockChecksum: '580ee05f-15fe-4146-bac2-6c382483c94e',
};

const validField: FieldManifest = {
  objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',

  universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
  type: FieldMetadataType.NUMBER,
  name: 'healthScore',
  label: 'Health Score',
};

const validManifest: Manifest = {
  commandMenuItems: [],
  application: validApplication,
  objects: [],
  frontComponents: [],
  fields: [],
  logicFunctions: [],
  roles: [],
  skills: [],
  agents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
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
            universalIdentifier: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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

  describe('relation field validation', () => {
    it('should fail when a RELATION field in fields is missing relationType', () => {
      const relationFieldWithoutSettings = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440010',
        type: FieldMetadataType.RELATION,
        name: 'company',
        label: 'Company',
        relationTargetFieldMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440011',
        relationTargetObjectMetadataUniversalIdentifier:
          '20202020-b374-4779-a561-80086cb2e17f',
      } as unknown as FieldManifest;

      const result = manifestValidate({
        ...validManifest,
        fields: [relationFieldWithoutSettings],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('company');
      expect(result.errors[0]).toContain('missing relationType');
    });

    it('should fail when a RELATION field in object fields is missing relationType', () => {
      const result = manifestValidate({
        ...validManifest,
        objects: [
          {
            universalIdentifier: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            nameSingular: 'recipient',
            namePlural: 'recipients',
            labelSingular: 'Recipient',
            labelPlural: 'Recipients',
            labelIdentifierFieldMetadataUniversalIdentifier:
              '7c9e6679-7425-40de-944b-e07fc1f90ae7',
            fields: [
              {
                universalIdentifier: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
                type: FieldMetadataType.TEXT,
                name: 'name',
                label: 'Name',
              },
              {
                universalIdentifier: '550e8400-e29b-41d4-a716-446655440012',
                type: FieldMetadataType.RELATION,
                name: 'company',
                label: 'Company',
                relationTargetFieldMetadataUniversalIdentifier:
                  '550e8400-e29b-41d4-a716-446655440013',
                relationTargetObjectMetadataUniversalIdentifier:
                  '20202020-b374-4779-a561-80086cb2e17f',
              } as unknown as FieldManifest,
            ],
          },
        ],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('company');
      expect(result.errors[0]).toContain('missing relationType');
    });

    it('should pass when a RELATION field has valid universalSettings with relationType', () => {
      const validRelationField = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440014',
        type: FieldMetadataType.RELATION,
        name: 'company',
        label: 'Company',
        relationTargetFieldMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440015',
        relationTargetObjectMetadataUniversalIdentifier:
          '20202020-b374-4779-a561-80086cb2e17f',
        universalSettings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
      } as unknown as FieldManifest;

      const result = manifestValidate({
        ...validManifest,
        fields: [validRelationField],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when a MANY_TO_ONE field is missing joinColumnName', () => {
      const manyToOneWithoutJoinColumn = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440018',
        type: FieldMetadataType.RELATION,
        name: 'company',
        label: 'Company',
        relationTargetFieldMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440019',
        relationTargetObjectMetadataUniversalIdentifier:
          '20202020-b374-4779-a561-80086cb2e17f',
        universalSettings: {
          relationType: RelationType.MANY_TO_ONE,
        },
      } as unknown as FieldManifest;

      const result = manifestValidate({
        ...validManifest,
        fields: [manyToOneWithoutJoinColumn],
      });

      expect(result.isValid).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('company');
      expect(result.errors[0]).toContain('missing joinColumnName');
    });

    it('should pass when a ONE_TO_MANY field has no joinColumnName', () => {
      const oneToManyField = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440020',
        type: FieldMetadataType.RELATION,
        name: 'contacts',
        label: 'Contacts',
        relationTargetFieldMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440021',
        relationTargetObjectMetadataUniversalIdentifier:
          '20202020-b374-4779-a561-80086cb2e17f',
        universalSettings: {
          relationType: RelationType.ONE_TO_MANY,
        },
      } as unknown as FieldManifest;

      const result = manifestValidate({
        ...validManifest,
        fields: [oneToManyField],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when a RELATION field has an invalid relationType', () => {
      const relationFieldWithBadType = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440016',
        type: FieldMetadataType.RELATION,
        name: 'company',
        label: 'Company',
        relationTargetFieldMetadataUniversalIdentifier:
          '550e8400-e29b-41d4-a716-446655440017',
        relationTargetObjectMetadataUniversalIdentifier:
          '20202020-b374-4779-a561-80086cb2e17f',
        universalSettings: {
          relationType: 'INVALID_TYPE',
        },
      } as unknown as FieldManifest;

      const result = manifestValidate({
        ...validManifest,
        fields: [relationFieldWithBadType],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('company');
      expect(result.errors[0]).toContain('invalid relationType');
    });
  });

  describe('UUID version validation', () => {
    it('should pass with UUID v4 identifiers', () => {
      const result = manifestValidate({
        ...validManifest,
        fields: [validField],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass with UUID v5 identifiers', () => {
      const v5Field: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: '21f7f8de-8051-5b89-8680-0195ef798b6a',
        type: FieldMetadataType.TEXT,
        name: 'v5Field',
        label: 'V5 Field',
      };

      const result = manifestValidate({
        ...validManifest,
        fields: [v5Field],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with UUID v1 identifiers', () => {
      const v1Uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const v1Field: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: v1Uuid,
        type: FieldMetadataType.TEXT,
        name: 'v1Field',
        label: 'V1 Field',
      };

      const result = manifestValidate({
        ...validManifest,
        fields: [v1Field],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining(`"${v1Uuid}" is UUID version 1`),
      );
      expect(result.errors).toContainEqual(
        expect.stringContaining('Only UUID version 4 or higher is allowed'),
      );
    });

    it('should fail with UUID v3 identifiers', () => {
      const v3Uuid = 'a3bb189e-8bf9-3888-9912-ace4e6543002';
      const v3Field: FieldManifest = {
        objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        universalIdentifier: v3Uuid,
        type: FieldMetadataType.TEXT,
        name: 'v3Field',
        label: 'V3 Field',
      };

      const result = manifestValidate({
        ...validManifest,
        fields: [v3Field],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining(`"${v3Uuid}" is UUID version 3`),
      );
    });

    it('should fail with non-UUID universal identifiers', () => {
      const result = manifestValidate({
        ...validManifest,
        objects: [
          {
            universalIdentifier: 'not-a-uuid',
            nameSingular: 'myObject',
            namePlural: 'myObjects',
            labelSingular: 'My Object',
            labelPlural: 'My Objects',
            labelIdentifierFieldMetadataUniversalIdentifier:
              '550e8400-e29b-41d4-a716-446655440030',
            fields: [
              {
                universalIdentifier: '550e8400-e29b-41d4-a716-446655440030',
                type: FieldMetadataType.TEXT,
                name: 'name',
                label: 'Name',
              },
            ],
          },
        ],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('"not-a-uuid" is not a valid UUID'),
      );
    });

    it('should not report duplicate version errors for the same identifier', () => {
      const v1Uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

      const result = manifestValidate({
        ...validManifest,
        fields: [
          {
            objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
            universalIdentifier: v1Uuid,
            type: FieldMetadataType.TEXT,
            name: 'field1',
            label: 'Field 1',
          },
          {
            objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
            universalIdentifier: v1Uuid,
            type: FieldMetadataType.TEXT,
            name: 'field2',
            label: 'Field 2',
          },
        ],
      });

      const versionErrors = result.errors.filter((e) =>
        e.includes('is UUID version 1'),
      );

      expect(versionErrors).toHaveLength(1);
    });
  });
});
