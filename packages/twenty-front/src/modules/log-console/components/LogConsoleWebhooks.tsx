import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus, IconWebhook } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import {
  type LogConsoleResourceListColumn,
  LogConsoleResourceList,
} from '@/log-console/components/LogConsoleResourceList';
import { logConsoleWebhooksViewState } from '@/log-console/states/logConsoleWebhooksViewState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  GetWebhooksDocument,
  type GetWebhooksQuery,
} from '~/generated-metadata/graphql';

type WebhookListItem = GetWebhooksQuery['webhooks'][number];

export const LogConsoleWebhooks = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [logConsoleWebhooksView, setLogConsoleWebhooksView] = useAtomState(
    logConsoleWebhooksViewState,
  );
  const { data: webhooksData } = useQuery(GetWebhooksDocument);

  const columns: LogConsoleResourceListColumn<WebhookListItem>[] = [
    {
      label: t`Endpoint`,
      width: '5fr',
      renderCell: (webhook) => (
        <>
          <IconWebhook
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
          <OverflowingTextWithTooltip text={webhook.targetUrl} />
        </>
      ),
    },
    {
      label: t`Events`,
      width: '4fr',
      renderCell: (webhook) => (
        <OverflowingTextWithTooltip text={webhook.operations.join(', ')} />
      ),
    },
    {
      label: t`Description`,
      width: '4fr',
      renderCell: (webhook) => (
        <OverflowingTextWithTooltip text={webhook.description || '-'} />
      ),
    },
  ];

  return (
    <LogConsoleResourceList
      columns={columns}
      items={webhooksData?.webhooks ?? []}
      selectedItemId={
        logConsoleWebhooksView.type === 'detail'
          ? logConsoleWebhooksView.id
          : undefined
      }
      onItemClick={(webhook) =>
        setLogConsoleWebhooksView({ type: 'detail', id: webhook.id })
      }
      emptyLabel={t`No webhooks found`}
      getSearchableValues={(webhook) => [
        webhook.targetUrl,
        webhook.description ?? '',
      ]}
      searchPlaceholder={t`Search webhooks`}
      scrollWrapperInstanceId="log-console-webhooks"
      actions={
        <Button
          startIcon={<IconPlus />}
          variant="outline"
          onClick={() => setLogConsoleWebhooksView({ type: 'new' })}
        >{t`New webhook`}</Button>
      }
    />
  );
};
