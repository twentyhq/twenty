import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';

export const APPLICATION_CONTENT_FILTER_LABELS: Record<
  ApplicationContentFilterKey,
  MessageDescriptor
> = {
  object: msg`Object`,
  field: msg`Field`,
  view: msg`View`,
  pageLayout: msg`Layout`,
};
