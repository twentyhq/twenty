import { type CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { type CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { type MessageDescriptor } from '@lingui/core';
import {
  type CommandMenuItemViewType,
  type Nullable,
} from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';
import { type MenuItemAccent } from 'twenty-ui/navigation';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type CommandMenuItemConfig = {
  type: CommandMenuItemType;
  scope: CommandMenuItemScope;
  key: string;
  id?: string;
  label: Nullable<MessageDescriptor | string>;
  shortLabel?: Nullable<MessageDescriptor | string>;
  description?: MessageDescriptor | string;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  isPrimaryCTA?: boolean;
  accent?: MenuItemAccent;
  availableOn?: CommandMenuItemViewType[];
  shouldBeRegistered?: () => boolean;
  component: React.ReactNode;
  hotKeys?: Nullable<string[]>;
  requiredPermissionFlag?: PermissionFlagType;
  isAllowedDuringGlobalLayoutCustomization?: boolean;
};
