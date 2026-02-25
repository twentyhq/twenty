import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';

import {
    CLOUD_USER_ON_CLOUD_USER_WORKSPACE_ID,
    CLOUD_USER_WORKSPACES_ON_CLOUD_USER_ID,
} from 'src/fields/cloud-user-workspaces-on-cloud-user.field';
import { CLOUD_USER_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-2';
import { CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-workspace-2';

export default defineField({
  universalIdentifier: CLOUD_USER_ON_CLOUD_USER_WORKSPACE_ID,
  objectUniversalIdentifier: CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'cloudUser2',
  label: 'Cloud User 2',
  relationTargetObjectMetadataUniversalIdentifier:
    CLOUD_USER_2_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CLOUD_USER_WORKSPACES_ON_CLOUD_USER_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'cloudUser2Id',
  },
});
