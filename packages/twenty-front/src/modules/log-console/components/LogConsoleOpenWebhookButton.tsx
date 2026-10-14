import { useLingui } from '@lingui/react/macro';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { useOpenLogConsoleTab } from '@/log-console/hooks/useOpenLogConsoleTab';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type LogConsoleOpenWebhookButtonProps = {
  webhookId: string;
};

export const LogConsoleOpenWebhookButton = ({
  webhookId,
}: LogConsoleOpenWebhookButtonProps) => {
  const { t } = useLingui();
  const { openLogConsoleTab } = useOpenLogConsoleTab();
  const hasApiKeysAndWebhooksPermission = useHasPermissionFlag(
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  );

  if (!hasApiKeysAndWebhooksPermission) {
    return null;
  }

  return (
    <Button
      size="sm"
      startIcon={<IconArrowUpRight />}
      onClick={() =>
        openLogConsoleTab({
          tabId: 'webhooks',
          view: { type: 'detail', id: webhookId },
        })
      }
      style={{ alignSelf: 'flex-start' }}
    >
      {t`Open webhook settings`}
    </Button>
  );
};
