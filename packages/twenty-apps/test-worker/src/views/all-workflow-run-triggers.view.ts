import {
  defineView,
  getFieldUniversalIdentifier,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  WORKFLOW_RUN_TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER,
} from 'src/objects/workflow-run-trigger.object';

const WORKFLOW_RUN_TRIGGER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER,
    name: 'createdAt',
  });

const WORKFLOW_RUN_TRIGGER_CREATED_BY_FIELD_UNIVERSAL_IDENTIFIER =
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER,
    name: 'createdBy',
  });

export default defineView({
  universalIdentifier: '036b8dcf-08c0-45f5-a03d-f14d2be91a70',
  name: 'All Workflow run triggers',
  objectUniversalIdentifier: WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBolt',
  position: 0,
  fields: [
    {
      universalIdentifier: '6a48a7be-d3a0-40ff-bf8a-69a5a63043f0',
      fieldMetadataUniversalIdentifier:
        WORKFLOW_RUN_TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 300,
    },
    {
      universalIdentifier: '99aa33e7-a7f7-4ea6-b9e9-d389e74bfaab',
      fieldMetadataUniversalIdentifier:
        WORKFLOW_RUN_TRIGGER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '57abd33c-2033-4544-8235-49b7936044d5',
      fieldMetadataUniversalIdentifier:
        WORKFLOW_RUN_TRIGGER_CREATED_BY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 200,
    },
  ],
  sorts: [
    {
      universalIdentifier: '2446062d-3de7-4fb2-bd53-55065d0f89f9',
      fieldMetadataUniversalIdentifier:
        WORKFLOW_RUN_TRIGGER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
