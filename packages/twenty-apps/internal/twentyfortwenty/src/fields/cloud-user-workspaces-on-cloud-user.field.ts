import { defineField, FieldType, RelationType } from 'twenty-sdk';

import { CLOUD_USER_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-2';
import { CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-workspace-2';

export const CLOUD_USER_WORKSPACES_ON_CLOUD_USER_ID =
  '2290d722-d4b1-47ab-a895-4e2c3163a541';
export const CLOUD_USER_ON_CLOUD_USER_WORKSPACE_ID =
  '49b08cf9-15e1-4583-826f-943fe3c6b0e8';

export default defineField({
  universalIdentifier: CLOUD_USER_WORKSPACES_ON_CLOUD_USER_ID,
  objectUniversalIdentifier: CLOUD_USER_2_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'cloudUserWorkspaces2',
  label: 'Cloud User Workspaces 2',
  relationTargetObjectMetadataUniversalIdentifier:
    CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CLOUD_USER_ON_CLOUD_USER_WORKSPACE_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
