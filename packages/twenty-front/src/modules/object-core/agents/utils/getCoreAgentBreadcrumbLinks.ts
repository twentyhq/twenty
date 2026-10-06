import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';

export const getCoreAgentBreadcrumbLinks = (
  links: BreadcrumbProps['links'] = [],
): BreadcrumbProps['links'] => [
  {
    children: t`Agents`,
    href: getAppPath(AppPath.AgentIndexPage),
  },
  ...links,
];
