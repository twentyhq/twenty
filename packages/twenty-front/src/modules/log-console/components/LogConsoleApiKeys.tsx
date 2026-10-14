import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconKey, IconPlus } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LogConsoleApiDocumentationDropdown } from '@/log-console/components/LogConsoleApiDocumentationDropdown';
import { LogConsoleListLayout } from '@/log-console/components/LogConsoleListLayout';
import {
  type LogConsoleListTableColumn,
  LogConsoleListTable,
} from '@/log-console/components/LogConsoleListTable';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
import {
  formatExpiration,
  isExpired,
} from '@/settings/developers/utils/formatExpiration';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  GetApiKeysDocument,
  type GetApiKeysQuery,
} from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ApiKeyListItem = GetApiKeysQuery['apiKeys'][number];

export const LogConsoleApiKeys = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [logConsoleApisView, setLogConsoleApisView] = useAtomState(
    logConsoleApisViewState,
  );
  const { data: apiKeysData } = useQuery(GetApiKeysDocument);

  const getApiKeyName = (apiKey: ApiKeyListItem) =>
    apiKey.name || t`Unnamed API Key`;

  const filteredApiKeys = filterBySearchQuery({
    items: apiKeysData?.apiKeys ?? [],
    searchQuery: searchValue,
    getSearchableValues: (apiKey) => [getApiKeyName(apiKey)],
  });

  const columns: LogConsoleListTableColumn<ApiKeyListItem>[] = [
    {
      label: t`Name`,
      width: '5fr',
      renderCell: (apiKey) => (
        <>
          <IconKey size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          <OverflowingTextWithTooltip text={getApiKeyName(apiKey)} />
        </>
      ),
    },
    {
      label: t`Role`,
      width: '4fr',
      renderCell: (apiKey) => (
        <OverflowingTextWithTooltip text={apiKey.role.label} />
      ),
    },
    {
      label: t`Expires`,
      width: '3fr',
      renderCell: (apiKey) =>
        isExpired(apiKey.expiresAt) ? (
          <Tag color="red">{t`Expired`}</Tag>
        ) : (
          <OverflowingTextWithTooltip
            text={formatExpiration(apiKey.expiresAt)}
          />
        ),
    },
  ];

  return (
    <LogConsoleListLayout
      searchPlaceholder={t`Search API keys`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      scrollWrapperInstanceId="log-console-api-keys"
      actions={
        <>
          <LogConsoleApiDocumentationDropdown />
          <Button
            startIcon={<IconPlus />}
            variant="outline"
            onClick={() => setLogConsoleApisView({ type: 'new' })}
          >{t`New API key`}</Button>
        </>
      }
    >
      <LogConsoleListTable
        columns={columns}
        items={filteredApiKeys}
        getItemId={(apiKey) => apiKey.id}
        selectedItemId={
          logConsoleApisView.type === 'detail'
            ? logConsoleApisView.id
            : undefined
        }
        onItemClick={(apiKey) =>
          setLogConsoleApisView({ type: 'detail', id: apiKey.id })
        }
        emptyLabel={t`No API keys found`}
      />
    </LogConsoleListLayout>
  );
};
