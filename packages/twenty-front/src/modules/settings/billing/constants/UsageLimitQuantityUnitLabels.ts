import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { UsageOperationType } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_QUANTITY_UNIT_LABELS: Partial<
  Record<UsageOperationType, MessageDescriptor>
> = {
  [UsageOperationType.WEB_SEARCH]: msg`searches`,
  [UsageOperationType.WORKFLOW_EXECUTION]: msg`runs`,
  [UsageOperationType.CODE_EXECUTION]: msg`runs`,
};
