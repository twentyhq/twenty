import { type MessageDescriptor } from '@lingui/core';
import { type SettingsPath } from 'twenty-shared/types';

export type SettingsSearchRouteMetadata = {
  title: MessageDescriptor;
  section?: MessageDescriptor;
  parentPath?: SettingsPath;
  keywords?: MessageDescriptor[];
  isBillingRequired?: boolean;
};
