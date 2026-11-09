import { type MessageDescriptor } from '@lingui/core';

import { type ApplicationContentColumnSource } from '@/settings/applications/types/ApplicationContentColumnSource';
import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export type ApplicationContentColumn = {
  label: MessageDescriptor;
  source: ApplicationContentColumnSource;
  link?: {
    contentType: ApplicationContentType;
    filter: ApplicationContentFilterKey;
  };
};
