/* @license Enterprise */

import { type RecordSharingRule } from 'src/engine/core-modules/record-share/types/record-sharing-rule.type';
import { WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE } from 'src/engine/core-modules/workflow/utils/workflow-run-of-shared-workflow-sharing-rule.util';

export const RECORD_SHARING_RULES: RecordSharingRule[] = [
  WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE,
];
