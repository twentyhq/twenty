import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsMcpServerConnectionsSection } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsSection';
import {
  ApplicationConnectionProvidersDocument,
  ConnectionProviderScope,
  type McpServerFragmentFragment,
} from '~/generated-metadata/graphql';

type SettingsMcpServerSignInSectionProps = {
  mcpServer: Pick<
    McpServerFragmentFragment,
    'id' | 'applicationId' | 'connectionProviderId'
  >;
};

export const SettingsMcpServerSignInSection = ({
  mcpServer,
}: SettingsMcpServerSignInSectionProps) => {
  const { t } = useLingui();
  const { data, error, refetch } = useQuery(
    ApplicationConnectionProvidersDocument,
    {
      variables: { applicationId: mcpServer.applicationId },
      skip: !isDefined(mcpServer.connectionProviderId),
      // Every server of an application shares this list, so a cached copy can
      // predate the provider created with this server.
      fetchPolicy: 'cache-and-network',
    },
  );

  if (isDefined(error)) {
    return (
      <SettingsApplicationLoadErrorBanner
        message={t`The sign-in for this server could not be loaded. Check your connection and try again.`}
        onRetry={() => refetch().catch(() => undefined)}
      />
    );
  }

  const perMemberConnectionProvider = data?.applicationConnectionProviders.find(
    (connectionProvider) =>
      connectionProvider.id === mcpServer.connectionProviderId &&
      connectionProvider.scope === ConnectionProviderScope.USER,
  );

  if (!isDefined(perMemberConnectionProvider)) {
    return null;
  }

  return (
    <SettingsMcpServerConnectionsSection
      mcpServerId={mcpServer.id}
      connectionProvider={perMemberConnectionProvider}
    />
  );
};
