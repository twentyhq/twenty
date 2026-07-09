import { FieldType } from '@/sdk/define';
import type { Manifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

export const EXPECTED_MANIFEST: Manifest = {
  commandMenuItems: [],
  application: {
    universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
    displayName: 'Root App',
    description: 'An app with all entities at root level',
    galleryImages: [],
    defaultRoleUniversalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000002',
    packageJsonChecksum: '[checksum]',
    yarnLockChecksum: '[checksum]',
    requiredServerVersionRange: null,
  },
  permissionFlags: [],
  skills: [],
  agents: [],
  publicAssets: [],
  indexes: [],
  fields: [
    {
      name: 'targetMyNote',
      label: 'MyNote',
      description: 'MyNote My note',
      icon: 'IconTimelineEvent',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetMyNoteId',
      },
      universalIdentifier: '55153e55-1bdc-590d-8fb1-40eafec88ef0',
      objectUniversalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      relationTargetFieldMetadataUniversalIdentifier:
        '559713af-d9c0-5894-a972-9a3951661a2b',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1e2e3e4-e5e6-4000-8000-000000000030',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
    },
    {
      name: 'targetMyNote',
      label: 'MyNote',
      description: 'MyNote My note',
      icon: 'IconFileImport',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetMyNoteId',
      },
      universalIdentifier: '80596d88-f896-5108-8cff-302a2eb61668',
      objectUniversalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
      relationTargetFieldMetadataUniversalIdentifier:
        '8f8e42e3-77de-5b0a-b444-d96b6d3c7600',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1e2e3e4-e5e6-4000-8000-000000000030',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-f634-435d-ab8d-e1168b375c69',
    },
    {
      name: 'targetMyNote',
      label: 'MyNote',
      description: 'MyNote My note',
      icon: 'IconCheckbox',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetMyNoteId',
      },
      universalIdentifier: '67bf90bd-f3d0-58ce-a96e-648364249812',
      objectUniversalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
      relationTargetFieldMetadataUniversalIdentifier:
        '0cbc9a5c-34b2-5d39-97a2-878662cb13d5',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1e2e3e4-e5e6-4000-8000-000000000030',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-f635-435d-ab8d-e1168b375c70',
    },
    {
      name: 'targetMyNote',
      label: 'MyNote',
      description: 'MyNote My note',
      icon: 'IconCheckbox',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetMyNoteId',
      },
      universalIdentifier: '2689365b-e6ce-5b14-a2b5-6daafbfe91f8',
      objectUniversalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
      relationTargetFieldMetadataUniversalIdentifier:
        'affdd37c-4460-53fc-998b-ffb04bb3a470',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1e2e3e4-e5e6-4000-8000-000000000030',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-f636-435d-ab8d-e1168b375c71',
    },
  ],
  objects: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000030',
      nameSingular: 'myNote',
      namePlural: 'myNotes',
      labelSingular: 'My note',
      labelPlural: 'My notes',
      description: 'A simple root-level object',
      icon: 'IconNote',
      labelIdentifierFieldMetadataUniversalIdentifier:
        'e1e2e3e4-e5e6-4000-8000-000000000031',
      fields: [
        {
          universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000031',
          type: FieldType.TEXT,
          label: 'Title',
          name: 'title',
        },
        {
          defaultValue: null,
          description: 'Name',
          icon: 'IconAbc',
          isNullable: true,
          label: 'Name',
          name: 'name',
          type: FieldMetadataType.TEXT,
          universalIdentifier: '9a7f457a-6c15-581e-8f28-e2c680f75f97',
        },
        {
          name: 'timelineActivities',
          label: 'Timeline Activities',
          description: 'My notes tied to the MyNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldType.RELATION,
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
          universalIdentifier: '559713af-d9c0-5894-a972-9a3951661a2b',
          relationTargetFieldMetadataUniversalIdentifier:
            '55153e55-1bdc-590d-8fb1-40eafec88ef0',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-6736-4337-b5c4-8b39fae325a5',
        },
        {
          name: 'attachments',
          label: 'Attachments',
          description: 'My notes tied to the MyNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldType.RELATION,
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
          universalIdentifier: '8f8e42e3-77de-5b0a-b444-d96b6d3c7600',
          relationTargetFieldMetadataUniversalIdentifier:
            '80596d88-f896-5108-8cff-302a2eb61668',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-bd3d-4c60-8dca-571c71d4447a',
        },
        {
          name: 'noteTargets',
          label: 'Note Targets',
          description: 'My notes tied to the MyNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldType.RELATION,
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
          universalIdentifier: '0cbc9a5c-34b2-5d39-97a2-878662cb13d5',
          relationTargetFieldMetadataUniversalIdentifier:
            '67bf90bd-f3d0-58ce-a96e-648364249812',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-fff0-4b44-be82-bda313884400',
        },
        {
          name: 'taskTargets',
          label: 'Task Targets',
          description: 'My notes tied to the MyNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldType.RELATION,
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
          universalIdentifier: 'affdd37c-4460-53fc-998b-ffb04bb3a470',
          relationTargetFieldMetadataUniversalIdentifier:
            '2689365b-e6ce-5b14-a2b5-6daafbfe91f8',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-5a9a-44e8-95df-771cd06d0fb1',
        },
      ],
    },
  ],
  logicFunctions: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000010',
      name: 'my-function',
      timeoutSeconds: 5,
      httpRouteTriggerSettings: {
        path: '/my-function',
        httpMethod: 'GET',
        isAuthRequired: false,
      },
      handlerName: 'default.config.handler',
      sourceHandlerPath: 'my.function.ts',
      builtHandlerPath: 'my.function.mjs',
      builtHandlerChecksum: '[checksum]',
    },
  ],
  frontComponents: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000020',
      name: 'my-component',
      description: 'A root-level front component',
      componentName: 'MyComponent',
      sourceComponentPath: 'my.front-component.tsx',
      builtComponentPath: 'my.front-component.mjs',
      builtComponentChecksum: '[checksum]',
      isHeadless: false,
      usesSdkClient: false,
    },
  ],
  views: [],
  viewFields: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  roles: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000040',
      label: 'My role',
      description: 'A simple root-level role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canUpdateAllSettings: false,
      canBeAssignedToAgents: false,
      canBeAssignedToUsers: true,
      canBeAssignedToApiKeys: false,
      fieldPermissions: [],
      objectPermissions: [],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
      permissionFlagUniversalIdentifiers: [],
    },
  ],
};
