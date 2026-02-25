import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';

import {
    CLOUD_USER_WORKSPACES_ON_CLOUD_WORKSPACE_ID,
    CLOUD_WORKSPACE_ON_CLOUD_USER_WORKSPACE_ID,
} from 'src/fields/cloud-user-workspaces-on-cloud-workspace.field';
import { CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-workspace-2';
import { CLOUD_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-workspace-2';

export default defineField({
  universalIdentifier: CLOUD_WORKSPACE_ON_CLOUD_USER_WORKSPACE_ID,
  objectUniversalIdentifier: CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'cloudWorkspace2',
  label: 'Cloud Workspace 2',
  relationTargetObjectMetadataUniversalIdentifier:
    CLOUD_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CLOUD_USER_WORKSPACES_ON_CLOUD_WORKSPACE_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'cloudWorkspace2Id',
  },
});
