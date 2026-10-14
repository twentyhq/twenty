import { useLingui } from '@lingui/react/macro';
import {
  IconApi,
  IconTerminal,
  IconTerminal2,
  IconWebhook,
} from 'twenty-ui/icon';

import { type LogConsoleTabId } from '@/log-console/types/LogConsoleTabId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useLogConsoleTabs = () => {
  const { t } = useLingui();
  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );
  const hasApiKeysAndWebhooksPermission = useHasPermissionFlag(
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  );

  const tabs: SingleTabProps<LogConsoleTabId>[] = [
    {
      id: 'logs',
      title: t`Logs`,
      Icon: IconTerminal2,
      hide: !hasSecurityPermission,
    },
    {
      id: 'apis',
      title: t`APIs`,
      Icon: IconApi,
      hide: !hasApiKeysAndWebhooksPermission,
    },
    {
      id: 'webhooks',
      title: t`Webhooks`,
      Icon: IconWebhook,
      hide: !hasApiKeysAndWebhooksPermission,
    },
    {
      id: 'cli',
      title: t`CLI`,
      Icon: IconTerminal,
    },
  ];

  return tabs.filter((tab) => !tab.hide);
};
