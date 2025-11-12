import { type ActionScope } from '@/action-menu/actions/types/ActionScope';
import { type ActionType } from '@/action-menu/actions/types/ActionType';
import { type ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/display';
import { type MenuItemAccent } from 'twenty-ui/navigation';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type ActionConfig = {
  type: ActionType;
  scope: ActionScope;
  key: string;
  label: MessageDescriptor | string;
  shortLabel?: MessageDescriptor | string;
  description?: MessageDescriptor | string;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  isPrimaryCTA?: boolean;
  accent?: MenuItemAccent;
  availableOn?: ActionViewType[];
  shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  component: React.ReactNode;
  hotKeys?: string[];
  requiredPermissionFlag?: PermissionFlagType;
};
