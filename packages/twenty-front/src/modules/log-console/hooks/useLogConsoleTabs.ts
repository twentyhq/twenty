import { useLingui } from '@lingui/react/macro';
import {
  IconApi,
  type IconComponent,
  IconTerminal,
  IconTerminal2,
  IconWebhook,
} from 'twenty-ui/icon';

import { type LogConsoleTabId } from '@/log-console/types/LogConsoleTabId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type LogConsoleTab = {
  id: LogConsoleTabId;
  title: string;
  Icon: IconComponent;
};

export const useLogConsoleTabs = (): LogConsoleTab[] => {
  const { t } = useLingui();
  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );
  const hasApiKeysAndWebhooksPermission = useHasPermissionFlag(
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  );

  return [
    {
      id: 'logs' as const,
      title: t`Logs`,
      Icon: IconTerminal2,
      isAvailable: hasSecurityPermission,
    },
    {
      id: 'apis' as const,
      title: t`APIs`,
      Icon: IconApi,
      isAvailable: hasApiKeysAndWebhooksPermission,
    },
    {
      id: 'webhooks' as const,
      title: t`Webhooks`,
      Icon: IconWebhook,
      isAvailable: hasApiKeysAndWebhooksPermission,
    },
    {
      id: 'cli' as const,
      title: t`CLI`,
      Icon: IconTerminal,
      isAvailable: true,
    },
  ]
    .filter(({ isAvailable }) => isAvailable)
    .map(({ id, title, Icon }) => ({ id, title, Icon }));
};
