import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { MessageDescriptor } from '@lingui/core';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemAccent } from 'twenty-ui/navigation';

export type RecordConfigAction = {
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
  useAction: ActionHook;
  hotKeys?: string[];
};
