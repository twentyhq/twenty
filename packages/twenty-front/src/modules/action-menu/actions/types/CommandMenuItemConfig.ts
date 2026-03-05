import { type CommandMenuItemScope } from '@/action-menu/actions/types/CommandMenuItemScope';
import { type CommandMenuItemType } from '@/action-menu/actions/types/CommandMenuItemType';
import { type CommandMenuItemViewType } from 'twenty-shared/types';
import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/display';
import { type MenuItemAccent } from 'twenty-ui/navigation';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type CommandMenuItemConfig = {
  type: CommandMenuItemType;
  scope: CommandMenuItemScope;
  key: string;
  label: MessageDescriptor | string;
  shortLabel?: MessageDescriptor | string;
  description?: MessageDescriptor | string;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  isPrimaryCTA?: boolean;
  accent?: MenuItemAccent;
  availableOn?: CommandMenuItemViewType[];
  shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  component: React.ReactNode;
  hotKeys?: string[];
  requiredPermissionFlag?: PermissionFlagType;
};
