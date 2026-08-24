import {
  type ApplicationManifest,
  type FieldManifest,
  type Manifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import {
  AggregateOperations,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
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
  timelineActivityTypes: [],
  application: validApplication,
  objects: [],
  frontComponents: [],
  fields: [],
  logicFunctions: [],
  permissionFlags: [],
  roles: [],
  skills: [],
  agents: [],
  publicAssets: [],
  views: [],
  viewFields: [],
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
    });

    it.each(['onConnectLogicFunction', 'onDisconnectLogicFunction'] as const)(
      'should not flag a connection provider referencing a logic function via %s as a duplicate',
      (lifecycleHookKey) => {
        const logicFunctionId = '550e8400-e29b-41d4-a716-446655440040';

        const logicFunction = {
          universalIdentifier: logicFunctionId,
          name: lifecycleHookKey,
          sourceHandlerPath: 'src/logic-functions/lifecycle-hook.ts',
          builtHandlerPath: 'dist/lifecycle-hook.js',
          builtHandlerChecksum: '00000000-0000-4000-8000-000000000000',
          handlerName: 'handler',
        } as unknown as Manifest['logicFunctions'][number];

        const connectionProvider = {
          universalIdentifier: '550e8400-e29b-41d4-a716-446655440041',
          name: 'slack',
          displayName: 'Slack',
          type: 'oauth',
          oauth: {},
          [lifecycleHookKey]: { universalIdentifier: logicFunctionId },
        } as unknown as NonNullable<Manifest['connectionProviders']>[number];

        const result = manifestValidate({
          ...validManifest,
          logicFunctions: [logicFunction],
          connectionProviders: [connectionProvider],
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      },
    );

    it('should not flag a front component referenced via settingsFrontComponent as a duplicate', () => {
      const frontComponentId = '550e8400-e29b-41d4-a716-446655440050';

      const frontComponent = {
        universalIdentifier: frontComponentId,
        name: 'app-settings',
        componentName: 'AppSettings',
        sourceComponentPath: 'src/front-components/app-settings.tsx',
        builtComponentPath: 'dist/app-settings.mjs',
        builtComponentChecksum: '00000000-0000-4000-8000-000000000000',
        isHeadless: false,
      } as unknown as Manifest['frontComponents'][number];

      const result = manifestValidate({
        ...validManifest,
        application: {
          ...validApplication,
          settingsFrontComponent: { universalIdentifier: frontComponentId },
        },
        frontComponents: [frontComponent],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
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

  describe('graph widget validation', () => {
    const makeGraphWidgetTab = (
      configuration: PageLayoutWidgetManifest['configuration'],
    ): PageLayoutTabManifest => ({
      universalIdentifier: 'b0a5f0f2-6c2e-4d1c-9d0b-2f8a4c3e1a01',
      title: 'Dashboard',
      position: 0,
      widgets: [
        {
          universalIdentifier: 'b0a5f0f2-6c2e-4d1c-9d0b-2f8a4c3e1a02',
          title: 'Total opportunities',
          type: 'GRAPH',
          configuration,
        },
      ],
    });

    it('should pass when a graph widget has aggregateFieldMetadataUniversalIdentifier', () => {
      const result = manifestValidate({
        ...validManifest,
        pageLayoutTabs: [
          makeGraphWidgetTab({
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              'b0a5f0f2-6c2e-4d1c-9d0b-2f8a4c3e1a03',
            aggregateOperation: AggregateOperations.COUNT,
          }),
        ],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error when a graph widget is missing the aggregate field identifier', () => {
      const result = manifestValidate({
        ...validManifest,
        pageLayoutTabs: [
          makeGraphWidgetTab({
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: null,
            aggregateOperation: AggregateOperations.COUNT,
          }),
        ],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining(
          'is missing aggregateFieldMetadataUniversalIdentifier',
        ),
      );
    });

    it('should hint at the correct key when the raw aggregateFieldMetadataId was used', () => {
      const configurationWithRawKey = {
        configurationType: 'AGGREGATE_CHART',
        aggregateFieldMetadataId: 'b0a5f0f2-6c2e-4d1c-9d0b-2f8a4c3e1a03',
        aggregateOperation: AggregateOperations.COUNT,
      } as unknown as PageLayoutWidgetManifest['configuration'];

      const result = manifestValidate({
        ...validManifest,
        pageLayoutTabs: [makeGraphWidgetTab(configurationWithRawKey)],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('not "aggregateFieldMetadataId"'),
      );
    });

    it('should ignore non-graph widgets that have no aggregate field', () => {
      const result = manifestValidate({
        ...validManifest,
        pageLayoutTabs: [makeGraphWidgetTab({ configurationType: 'TIMELINE' })],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not crash on a widget with a missing configuration', () => {
      const nullConfiguration =
        null as unknown as PageLayoutWidgetManifest['configuration'];

      const result = manifestValidate({
        ...validManifest,
        pageLayoutTabs: [makeGraphWidgetTab(nullConfiguration)],
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('timeline activity type validation', () => {
    const sourceObjectUniversalIdentifier =
      '1a111111-1111-4111-8111-111111111111';
    const relationFieldUniversalIdentifier =
      '2a222222-2222-4222-8222-222222222222';
    const triggerFieldUniversalIdentifier =
      '3a333333-3333-4333-8333-333333333333';
    const frontComponentUniversalIdentifier =
      '4a444444-4444-4444-8444-444444444444';

    const buildTimelineManifest = (): Manifest => ({
      ...validManifest,
      objects: [
        {
          universalIdentifier: sourceObjectUniversalIdentifier,
          nameSingular: 'deployment',
          namePlural: 'deployments',
          labelSingular: 'Deployment',
          labelPlural: 'Deployments',
          labelIdentifierFieldMetadataUniversalIdentifier:
            triggerFieldUniversalIdentifier,
          fields: [],
        },
      ],
      fields: [
        {
          universalIdentifier: relationFieldUniversalIdentifier,
          objectUniversalIdentifier: sourceObjectUniversalIdentifier,
          type: FieldMetadataType.RELATION,
          name: 'owner',
          label: 'Owner',
          relationTargetFieldMetadataUniversalIdentifier:
            '5a555555-5555-4555-8555-555555555555',
          relationTargetObjectMetadataUniversalIdentifier:
            '6a666666-6666-4666-8666-666666666666',
          universalSettings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'ownerId',
          },
        },
        {
          universalIdentifier: triggerFieldUniversalIdentifier,
          objectUniversalIdentifier: sourceObjectUniversalIdentifier,
          type: FieldMetadataType.TEXT,
          name: 'status',
          label: 'Status',
        },
      ],
      frontComponents: [
        {
          universalIdentifier: frontComponentUniversalIdentifier,
          sourceComponentPath: 'src/front-components/deployment.tsx',
          builtComponentPath: 'dist/front-components/deployment.mjs',
          builtComponentChecksum: 'checksum',
          componentName: 'DeploymentTimelineActivity',
        },
      ],
      timelineActivityTypes: [
        {
          universalIdentifier: '7a777777-7777-4777-8777-777777777777',
          name: 'deploymentUpdated',
          label: 'updated a deployment',
          emit: {
            on: 'updated',
            objectUniversalIdentifier: sourceObjectUniversalIdentifier,
            through: {
              relationFieldUniversalIdentifier,
              triggerFieldUniversalIdentifiers: [
                triggerFieldUniversalIdentifier,
              ],
            },
          },
          frontComponentUniversalIdentifier,
        },
      ],
    });

    it('accepts references to source metadata and front components in the application', () => {
      const result = manifestValidate(buildTimelineManifest());

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('reports references that cannot be resolved inside the application', () => {
      const manifest = buildTimelineManifest();
      const [timelineActivityType] = manifest.timelineActivityTypes;

      timelineActivityType.frontComponentUniversalIdentifier =
        '8a888888-8888-4888-8888-888888888888';
      timelineActivityType.emit!.through!.relationFieldUniversalIdentifier =
        '9a999999-9999-4999-8999-999999999999';
      timelineActivityType.emit!.through!.triggerFieldUniversalIdentifiers = [
        '0aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ];

      const result = manifestValidate(manifest);

      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('references front component'),
          expect.stringContaining('references relation field'),
          expect.stringContaining('references trigger fields'),
        ]),
      );
    });

    it('requires external-object emitters to declare the type they replace', () => {
      const manifest = buildTimelineManifest();
      const [timelineActivityType] = manifest.timelineActivityTypes;

      timelineActivityType.emit!.objectUniversalIdentifier =
        '0bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

      expect(manifestValidate(manifest).errors).toContainEqual(
        expect.stringContaining(
          'must declare replacesTimelineActivityTypeUniversalIdentifier',
        ),
      );

      timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier =
        '0ccccccc-cccc-4ccc-8ccc-cccccccccccc';

      expect(manifestValidate(manifest).errors).toHaveLength(0);
    });

    it('validates external-object route identifiers without resolving their metadata', () => {
      const manifest = buildTimelineManifest();
      const [timelineActivityType] = manifest.timelineActivityTypes;

      timelineActivityType.emit!.objectUniversalIdentifier =
        '0bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
      timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier =
        '0ccccccc-cccc-4ccc-8ccc-cccccccccccc';
      timelineActivityType.emit!.through!.relationFieldUniversalIdentifier =
        'not-a-relation-field-uuid';
      timelineActivityType.emit!.through!.triggerFieldUniversalIdentifiers = [
        'not-a-trigger-field-uuid',
      ];

      expect(manifestValidate(manifest).errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            'invalid through relation field universal identifier',
          ),
          expect.stringContaining(
            'invalid trigger field universal identifiers',
          ),
        ]),
      );
    });

    it('rejects an invalid emit object universal identifier', () => {
      const manifest = buildTimelineManifest();
      const [timelineActivityType] = manifest.timelineActivityTypes;

      timelineActivityType.emit!.objectUniversalIdentifier = 'POST_CARD_TYPO';
      timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier =
        '0ccccccc-cccc-4ccc-8ccc-cccccccccccc';

      expect(manifestValidate(manifest).errors).toContainEqual(
        expect.stringContaining('invalid object universal identifier'),
      );
    });

    it('rejects replacement contracts that cannot be valid locally', () => {
      const explicitManifest = buildTimelineManifest();
      const [explicitTimelineActivityType] =
        explicitManifest.timelineActivityTypes;

      explicitTimelineActivityType.emit = undefined;
      explicitTimelineActivityType.replacesTimelineActivityTypeUniversalIdentifier =
        '0ccccccc-cccc-4ccc-8ccc-cccccccccccc';

      expect(manifestValidate(explicitManifest).errors).toContainEqual(
        expect.stringContaining(
          'declares replacesTimelineActivityTypeUniversalIdentifier without an automatic emit contract',
        ),
      );

      const localObjectManifest = buildTimelineManifest();
      localObjectManifest.timelineActivityTypes[0].replacesTimelineActivityTypeUniversalIdentifier =
        '0ccccccc-cccc-4ccc-8ccc-cccccccccccc';

      expect(manifestValidate(localObjectManifest).errors).toContainEqual(
        expect.stringContaining("must not replace another application's type"),
      );

      const invalidIdentifierManifest = buildTimelineManifest();
      const invalidIdentifierTimelineActivityType =
        invalidIdentifierManifest.timelineActivityTypes[0];

      invalidIdentifierTimelineActivityType.emit!.objectUniversalIdentifier =
        '0bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
      invalidIdentifierTimelineActivityType.replacesTimelineActivityTypeUniversalIdentifier =
        'not-a-uuid';

      expect(manifestValidate(invalidIdentifierManifest).errors).toContainEqual(
        expect.stringContaining('invalid replacement universal identifier'),
      );
    });

    it.each([
      {
        action: 'updated' as const,
        triggerFieldUniversalIdentifiers: [],
      },
      {
        action: 'updated' as const,
        triggerFieldUniversalIdentifiers: [
          triggerFieldUniversalIdentifier,
          triggerFieldUniversalIdentifier,
        ],
      },
      {
        action: 'created' as const,
        triggerFieldUniversalIdentifiers: [triggerFieldUniversalIdentifier],
      },
    ])(
      'rejects invalid trigger constraints for $action events',
      ({ action, triggerFieldUniversalIdentifiers }) => {
        const manifest = buildTimelineManifest();
        const [timelineActivityType] = manifest.timelineActivityTypes;

        timelineActivityType.emit!.on = action;
        timelineActivityType.emit!.through!.triggerFieldUniversalIdentifiers =
          triggerFieldUniversalIdentifiers;

        expect(manifestValidate(manifest).errors).toContainEqual(
          expect.stringContaining(
            'trigger fields must be a non-empty list of unique fields on an updated through event',
          ),
        );
      },
    );

    it('requires linked and unlinked emitters to declare a through relation', () => {
      const manifest = buildTimelineManifest();
      const [timelineActivityType] = manifest.timelineActivityTypes;

      timelineActivityType.emit!.on = 'linked';
      timelineActivityType.emit!.through = undefined;

      expect(manifestValidate(manifest).errors).toContainEqual(
        expect.stringContaining('must declare emit.through for a linked event'),
      );
    });

    it('rejects duplicate names and unsupported through relations', () => {
      const manifest = buildTimelineManifest();
      const [timelineActivityType] = manifest.timelineActivityTypes;

      manifest.timelineActivityTypes.push({
        ...timelineActivityType,
        universalIdentifier: '0ddddddd-dddd-4ddd-8ddd-dddddddddddd',
      });
      manifest.fields[0].universalSettings = {
        relationType: RelationType.ONE_TO_MANY,
      };

      const result = manifestValidate(manifest);

      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            'Timeline activity type name "deploymentUpdated" is used more than once',
          ),
          expect.stringContaining(
            'must route through a MANY_TO_ONE relation or a junction-backed ONE_TO_MANY relation',
          ),
        ]),
      );
    });

    it('reports a relation with missing universal settings without crashing', () => {
      const manifest = buildTimelineManifest();

      manifest.fields[0].universalSettings = undefined as never;

      expect(manifestValidate(manifest).errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('is missing relationType'),
          expect.stringContaining(
            'must route through a MANY_TO_ONE relation or a junction-backed ONE_TO_MANY relation',
          ),
        ]),
      );
    });
  });
});
