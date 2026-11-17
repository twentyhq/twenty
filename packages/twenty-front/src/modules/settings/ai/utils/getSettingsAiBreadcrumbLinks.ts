import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const getSettingsAiBreadcrumbLinks = ({
  currentPageLabel,
  tabId,
}: {
  currentPageLabel: string;
  tabId?: string;
}) => [
  {
    children: t`Workspace`,
    href: getSettingsPath(SettingsPath.General),
  },
  {
    children: t`AI`,
    href: getSettingsPath(SettingsPath.AI, undefined, undefined, tabId),
  },
  { children: currentPageLabel },
];
