import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { MessageDescriptor } from '@lingui/core';
import { IconComponent, MenuItemAccent } from 'twenty-ui';

export type ActionConfig = {
  type: ActionMenuEntryType;
  scope: ActionMenuEntryScope;
  key: string;
  label: MessageDescriptor;
  shortLabel?: MessageDescriptor;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  accent?: MenuItemAccent;
  availableOn?: ActionViewType[];
  shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  component: React.ReactNode;
  hotKeys?: string[];
};
