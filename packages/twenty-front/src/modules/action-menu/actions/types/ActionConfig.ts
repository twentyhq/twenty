import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { MessageDescriptor } from '@lingui/core';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemAccent } from 'twenty-ui/navigation';
import { PermissionFlagType } from '~/generated-metadata/graphql';

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
  accent?: MenuItemAccent;
  availableOn?: ActionViewType[];
  shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  component: React.ReactNode;
  hotKeys?: string[];
  requiredPermissionFlag?: PermissionFlagType;
};
