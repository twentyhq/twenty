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
      // The cached list is shared by the app's servers and can predate this server's provider
      fetchPolicy: 'cache-and-network',
    },
  );

  const perMemberConnectionProvider = data?.applicationConnectionProviders.find(
    (connectionProvider) =>
      connectionProvider.id === mcpServer.connectionProviderId &&
      connectionProvider.scope === ConnectionProviderScope.USER,
  );

  if (isDefined(perMemberConnectionProvider)) {
    return (
      <SettingsMcpServerConnectionsSection
        mcpServerId={mcpServer.id}
        connectionProvider={perMemberConnectionProvider}
      />
    );
  }

  if (!isDefined(error)) {
    return null;
  }

  return (
    <SettingsApplicationLoadErrorBanner
      message={t`Your connections could not be loaded. Check your connection and try again.`}
      onRetry={() => refetch().catch(() => undefined)}
    />
  );
};
