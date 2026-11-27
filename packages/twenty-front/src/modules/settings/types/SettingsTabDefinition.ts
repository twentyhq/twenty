import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsTabDefinition = {
  id: string;
  title: MessageDescriptor;
  Icon: IconComponent;
  settingsPermission?: PermissionFlagType;
};
