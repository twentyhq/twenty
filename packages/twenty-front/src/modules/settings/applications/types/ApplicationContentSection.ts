import { type MessageDescriptor } from '@lingui/core';
import { type ThemeColor } from 'twenty-ui/theme';

import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export type ApplicationContentSection = {
  title: MessageDescriptor;
  description: MessageDescriptor;
  color: ThemeColor;
  contentTypes: ApplicationContentType[];
};
