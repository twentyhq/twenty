import { type SETTINGS_SEARCH_OBJECT_LABEL_TITLE } from '@/settings/search/constants/SettingsSearchObjectLabelTitle';
import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { type MessageDescriptor } from '@lingui/core';
import { type SettingsPath } from 'twenty-shared/types';

export type SettingsSearchRouteMetadata = {
  title: MessageDescriptor | typeof SETTINGS_SEARCH_OBJECT_LABEL_TITLE;
  keywords?: MessageDescriptor[];
  tabs?: SettingsTabDefinition[];
  isHiddenWhenBillingDisabled?: boolean;
  isExpandedPerObject?: boolean;
} & ({ section: MessageDescriptor } | { parentPath: SettingsPath });
