import { type MessageDescriptor } from '@lingui/core';
import { type SettingsPath } from 'twenty-shared/types';

export type SettingsSearchRouteMetadata = {
  title: MessageDescriptor;
  keywords?: MessageDescriptor[];
  isHiddenWhenBillingDisabled?: boolean;
} & ({ section: MessageDescriptor } | { parentPath: SettingsPath });
