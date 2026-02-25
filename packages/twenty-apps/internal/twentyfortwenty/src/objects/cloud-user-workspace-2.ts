import { defineObject, FieldType } from 'twenty-sdk';

import {
  CLOUD_USER_WORKSPACE_2_ID_OF_THE_USER_WORKSPACE_FIELD_ID,
  CLOUD_USER_WORKSPACE_2_TWENTY_USER_IDENTIFIER_FIELD_ID,
  CLOUD_USER_WORKSPACE_2_TWENTY_WORKSPACE_IDENTIFIER_FIELD_ID,
  CLOUD_USER_WORKSPACE_2_UPDATED_BY_FIELD_ID,
} from 'src/fields/cloud-user-workspace-2-field-ids';

export const CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER =
  '14d6e1f4-c513-4766-9210-bc5dc8294e51';

export default defineObject({
  universalIdentifier: CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  nameSingular: 'cloudUserWorkspace2',
  namePlural: 'cloudUserWorkspaces2',
  labelSingular: 'Cloud user workspace 2',
  labelPlural: 'Cloud user workspaces 2',
  icon: 'IconBox',
  fields: [
    {
      universalIdentifier: CLOUD_USER_WORKSPACE_2_TWENTY_USER_IDENTIFIER_FIELD_ID,
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
      universalIdentifier: CLOUD_USER_WORKSPACE_2_TWENTY_WORKSPACE_IDENTIFIER_FIELD_ID,
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
      universalIdentifier: CLOUD_USER_WORKSPACE_2_ID_OF_THE_USER_WORKSPACE_FIELD_ID,
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
      universalIdentifier: CLOUD_USER_WORKSPACE_2_UPDATED_BY_FIELD_ID,
      type: FieldType.ACTOR,
      name: 'updatedBy',
      label: 'Updated by',
      description: 'The user who last updated the record',
      icon: 'IconUserCircle',
      isNullable: true,
    },
  ],
});
