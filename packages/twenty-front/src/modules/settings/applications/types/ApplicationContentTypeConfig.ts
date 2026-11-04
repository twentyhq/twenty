import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { type ApplicationContentSecondaryColumnSource } from '@/settings/applications/types/ApplicationContentSecondaryColumnSource';

export type ApplicationContentTypeConfig = {
  label: MessageDescriptor;
  description: MessageDescriptor;
  Icon: IconComponent;
  secondaryColumn?: {
    label: MessageDescriptor;
    source: ApplicationContentSecondaryColumnSource;
  };
  countColumnLabel?: MessageDescriptor;
  tags?: Record<string, { label: MessageDescriptor; color: ThemeColor }>;
};
