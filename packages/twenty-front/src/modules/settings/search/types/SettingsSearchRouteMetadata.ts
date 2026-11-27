import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { type MessageDescriptor } from '@lingui/core';
import { type SettingsPath } from 'twenty-shared/types';

export type SettingsSearchRouteMetadata = {
  keywords?: MessageDescriptor[];
  tabs?: SettingsTabDefinition[];
  isHiddenWhenBillingDisabled?: boolean;
} & (
  | { title: MessageDescriptor; isExpandedPerObject?: boolean }
  | { title?: undefined; isExpandedPerObject: true }
) &
  ({ section: MessageDescriptor } | { parentPath: SettingsPath });
