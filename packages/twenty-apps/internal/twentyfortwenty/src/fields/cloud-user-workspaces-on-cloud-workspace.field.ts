import { defineField, FieldType, RelationType } from 'twenty-sdk';

import { CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-workspace-2';
import { CLOUD_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-workspace-2';

export const CLOUD_USER_WORKSPACES_ON_CLOUD_WORKSPACE_ID =
  '90d9dfc7-7058-4d1c-aac2-1505bd7cb827';
export const CLOUD_WORKSPACE_ON_CLOUD_USER_WORKSPACE_ID =
  '7bcd2dda-d1f8-4aa7-a83f-6cf240be80b2';

export default defineField({
  universalIdentifier: CLOUD_USER_WORKSPACES_ON_CLOUD_WORKSPACE_ID,
  objectUniversalIdentifier: CLOUD_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'cloudUserWorkspaces2',
  label: 'Cloud User Workspaces 2',
  relationTargetObjectMetadataUniversalIdentifier:
    CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CLOUD_WORKSPACE_ON_CLOUD_USER_WORKSPACE_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
