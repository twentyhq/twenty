import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath, type NativePageKey } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconLego,
  IconSettingsAutomation,
} from 'twenty-ui/icon';

export const NATIVE_PAGE_NAVIGATION_MENU_ITEM_CONFIGS: Record<
  NativePageKey,
  {
    label: MessageDescriptor;
    Icon: IconComponent;
    path: string;
    activePathPatterns: string[];
    requiredPermissionFlag?: PermissionFlagType;
  }
> = {
  workflows: {
    label: msg`Workflows`,
    Icon: IconSettingsAutomation,
    path: getAppPath(AppPath.WorkflowIndexPage),
    activePathPatterns: [
      AppPath.WorkflowIndexPage,
      AppPath.WorkflowCoreShowPage,
    ],
    requiredPermissionFlag: PermissionFlagType.WORKFLOWS,
  },
  agents: {
    label: msg`Agents`,
    Icon: IconLego,
    path: getAppPath(AppPath.AgentIndexPage),
    activePathPatterns: [AppPath.AgentIndexPage, AppPath.AgentShowPage],
    requiredPermissionFlag: PermissionFlagType.AI,
  },
};
