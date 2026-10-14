import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconPlus, IconWebhook } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LogConsoleListLayout } from '@/log-console/components/LogConsoleListLayout';
import {
  type LogConsoleListTableColumn,
  LogConsoleListTable,
} from '@/log-console/components/LogConsoleListTable';
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
  const [searchValue, setSearchValue] = useState('');
  const [logConsoleWebhooksView, setLogConsoleWebhooksView] = useAtomState(
    logConsoleWebhooksViewState,
  );
  const { data: webhooksData } = useQuery(GetWebhooksDocument);

  const normalizedSearchValue = searchValue.toLowerCase();

  const filteredWebhooks = (webhooksData?.webhooks ?? []).filter((webhook) =>
    [webhook.targetUrl, webhook.description ?? ''].some((value) =>
      value.toLowerCase().includes(normalizedSearchValue),
    ),
  );

  const columns: LogConsoleListTableColumn<WebhookListItem>[] = [
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
    <LogConsoleListLayout
      searchPlaceholder={t`Search webhooks`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      scrollWrapperInstanceId="log-console-webhooks"
      actions={
        <Button
          startIcon={<IconPlus />}
          size="sm"
          variant="outline"
          onClick={() => setLogConsoleWebhooksView({ type: 'new' })}
        >{t`New webhook`}</Button>
      }
    >
      <LogConsoleListTable
        columns={columns}
        items={filteredWebhooks}
        getItemId={(webhook) => webhook.id}
        selectedItemId={
          logConsoleWebhooksView.type === 'detail'
            ? logConsoleWebhooksView.id
            : undefined
        }
        onItemClick={(webhook) =>
          setLogConsoleWebhooksView({ type: 'detail', id: webhook.id })
        }
        emptyLabel={t`No webhooks found`}
      />
    </LogConsoleListLayout>
  );
};
