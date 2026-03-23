import { defineField, FieldType, RelationType } from 'twenty-sdk';

import {
  RECONCILIATION_RUN_OBJECT_ID,
  MATCH_RESULT_OBJECT_ID,
  MATCH_RESULTS_ON_RECONCILIATION_RUN_ID,
  RECONCILIATION_RUN_ON_MATCH_RESULT_ID,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MATCH_RESULTS_ON_RECONCILIATION_RUN_ID,
  objectUniversalIdentifier: RECONCILIATION_RUN_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'matchResults',
  label: 'Match Results',
  relationTargetObjectMetadataUniversalIdentifier: MATCH_RESULT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    RECONCILIATION_RUN_ON_MATCH_RESULT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconLink',
});
