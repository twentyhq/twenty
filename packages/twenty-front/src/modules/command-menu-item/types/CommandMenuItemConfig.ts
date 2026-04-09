import { type CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { type CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { type MessageDescriptor } from '@lingui/core';
import { type Nullable } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

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
  component: React.ReactNode;
  hotKeys?: Nullable<string[]>;
  isAllowedDuringGlobalLayoutCustomization?: boolean;
};
