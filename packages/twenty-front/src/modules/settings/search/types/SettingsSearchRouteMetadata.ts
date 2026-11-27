import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { type MessageDescriptor } from '@lingui/core';
import { type SettingsPath } from 'twenty-shared/types';

export type SettingsSearchRouteMetadata = {
  title: MessageDescriptor;
  keywords?: MessageDescriptor[];
  tabs?: SettingsTabDefinition[];
  requiresBillingEnabled?: boolean;
} & ({ section: MessageDescriptor } | { parentPath: SettingsPath });
