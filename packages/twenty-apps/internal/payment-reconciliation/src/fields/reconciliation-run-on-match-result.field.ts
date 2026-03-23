import { defineField, FieldType, RelationType } from 'twenty-sdk';

import {
  MATCH_RESULT_OBJECT_ID,
  RECONCILIATION_RUN_OBJECT_ID,
  RECONCILIATION_RUN_ON_MATCH_RESULT_ID,
  MATCH_RESULTS_ON_RECONCILIATION_RUN_ID,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: RECONCILIATION_RUN_ON_MATCH_RESULT_ID,
  objectUniversalIdentifier: MATCH_RESULT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'reconciliationRun',
  label: 'Reconciliation Run',
  relationTargetObjectMetadataUniversalIdentifier:
    RECONCILIATION_RUN_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    MATCH_RESULTS_ON_RECONCILIATION_RUN_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'reconciliationRunId',
  },
  icon: 'IconPlayerPlay',
});
