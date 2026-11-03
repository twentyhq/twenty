import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath, SettingsPath, type SystemPageKey } from 'twenty-shared/types';
import { getAppPath, getSettingsPath } from 'twenty-shared/utils';
import {
  IconHierarchy,
  IconLego,
  IconSettingsAutomation,
} from 'twenty-ui/icon';

import { type SystemPageNavigationMenuItemConfig } from '@/navigation-menu-item/display/system-page/types/SystemPageNavigationMenuItemConfig';

export const SYSTEM_PAGE_NAVIGATION_MENU_ITEM_CONFIGS: Record<
  SystemPageKey,
  SystemPageNavigationMenuItemConfig
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
  },
  dataModel: {
    label: msg`Data model`,
    Icon: IconHierarchy,
    path: getSettingsPath(SettingsPath.Objects),
    activePathPatterns: [`${getSettingsPath(SettingsPath.Objects)}/*`],
    requiredPermissionFlag: PermissionFlagType.DATA_MODEL,
  },
};
