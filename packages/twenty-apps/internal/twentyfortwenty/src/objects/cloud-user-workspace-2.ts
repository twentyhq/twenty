import { defineObject, FieldType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: '14d6e1f4-c513-4766-9210-bc5dc8294e51',
  nameSingular: 'cloudUserWorkspace2',
  namePlural: 'cloudUserWorkspaces2',
  labelSingular: 'Cloud user workspace 2',
  labelPlural: 'Cloud user workspaces 2',
  icon: 'IconBox',
  fields: [
    {
      universalIdentifier: 'b3c7e2a1-4d5f-4a8b-9c1e-2f3a4b5c6d7e',
      type: FieldType.TEXT,
      name: 'twentyUserIdentifier',
      label: 'Twenty User Identifier',
      icon: 'IconMan',
      isNullable: true,
      defaultValue: null,
      universalSettings: {
        displayedMaxRows: 0,
      },
    },
    {
      universalIdentifier: 'c4d8f3b2-5e6a-4b9c-ad2f-3a4b5c6d7e8f',
      type: FieldType.TEXT,
      name: 'twentyWorkspaceIdentifier',
      label: 'Twenty Workspace Identifier',
      icon: 'IconScreenShare',
      isNullable: true,
      defaultValue: null,
      universalSettings: {
        displayedMaxRows: 0,
      },
    },
    {
      universalIdentifier: 'd5e9a4c3-6f7b-4cad-be3a-4b5c6d7e8f9a',
      type: FieldType.TEXT,
      name: 'idOfTheUserWorkspace',
      label: 'Id of the user workspace',
      icon: 'IconTypography',
      isNullable: true,
      defaultValue: null,
      universalSettings: {
        displayedMaxRows: 0,
      },
    },
    {
      universalIdentifier: 'e6fab5d4-7a8c-4dbe-cf4b-5c6d7e8f9a0b',
      type: FieldType.ACTOR,
      name: 'updatedBy',
      label: 'Updated by',
      description: 'The user who last updated the record',
      icon: 'IconUserCircle',
      isNullable: true,
    },
  ],
});
