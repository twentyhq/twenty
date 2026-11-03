import { type MessageDescriptor } from '@lingui/core';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { type IconComponent } from 'twenty-ui/icon';

export type SystemPageNavigationMenuItemConfig = {
  label: MessageDescriptor;
  Icon: IconComponent;
  path: string;
  activePathPatterns: string[];
  requiredPermissionFlag?: PermissionFlagType;
};
