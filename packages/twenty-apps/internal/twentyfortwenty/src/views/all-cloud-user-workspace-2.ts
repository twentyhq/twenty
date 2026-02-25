import { defineView } from 'twenty-sdk';
import { ViewType } from 'twenty-shared/types';

import {
  CLOUD_USER_WORKSPACE_2_ID_OF_THE_USER_WORKSPACE_FIELD_ID,
  CLOUD_USER_WORKSPACE_2_TWENTY_USER_IDENTIFIER_FIELD_ID,
  CLOUD_USER_WORKSPACE_2_TWENTY_WORKSPACE_IDENTIFIER_FIELD_ID,
  CLOUD_USER_WORKSPACE_2_UPDATED_BY_FIELD_ID,
} from 'src/fields/cloud-user-workspace-2-field-ids';
import { CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-workspace-2';

export const ALL_CLOUD_USER_WORKSPACE_2_VIEW_ID =
  'f80e44ef-43fb-409e-a003-decadaa38b3e';

export default defineView({
  universalIdentifier: ALL_CLOUD_USER_WORKSPACE_2_VIEW_ID,
  name: 'all-cloud-user-workspace-2',
  objectUniversalIdentifier: CLOUD_USER_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: '4a0d9d93-d182-443d-8a70-3a4f25e51c50',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_WORKSPACE_2_TWENTY_USER_IDENTIFIER_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '14b78fc4-a6a5-471b-ba87-6aebc9a3da68',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_WORKSPACE_2_TWENTY_WORKSPACE_IDENTIFIER_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '8c9c8a1b-d511-4706-afe7-32b22cce2e7e',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_WORKSPACE_2_ID_OF_THE_USER_WORKSPACE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'ee35eded-4222-4a87-b31c-69e415e331db',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_WORKSPACE_2_UPDATED_BY_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 150,
    },
  ],
});
