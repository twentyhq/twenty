import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { UsageResourceType } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_RESOURCE_TYPE_LABELS: Record<
  UsageResourceType,
  MessageDescriptor
> = {
  [UsageResourceType.AI]: msg`AI`,
  [UsageResourceType.API]: msg`API`,
  [UsageResourceType.APP]: msg`Apps`,
  [UsageResourceType.EMAIL]: msg`Email`,
  [UsageResourceType.LOGIC_FUNCTION]: msg`Logic functions`,
  [UsageResourceType.STORAGE]: msg`Storage`,
  [UsageResourceType.WEBHOOK]: msg`Webhooks`,
  [UsageResourceType.WORKFLOW]: msg`Workflows`,
};
