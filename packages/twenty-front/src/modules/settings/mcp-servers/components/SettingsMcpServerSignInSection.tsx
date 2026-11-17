import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsMcpServerConnectionsSection } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsSection';
import {
  ApplicationConnectionProvidersDocument,
  ConnectionProviderScope,
} from '~/generated-metadata/graphql';

type SettingsMcpServerSignInSectionProps = {
  mcpServerId: string;
  applicationId: string;
  connectionProviderId: string;
};

export const SettingsMcpServerSignInSection = ({
  mcpServerId,
  applicationId,
  connectionProviderId,
}: SettingsMcpServerSignInSectionProps) => {
  const { t } = useLingui();
  const { data, error, refetch } = useQuery(
    ApplicationConnectionProvidersDocument,
    {
      variables: { applicationId },
      // Every server of an application shares this list, so a cached copy can
      // predate the provider created with this server.
      fetchPolicy: 'cache-and-network',
    },
  );
  const perMemberConnectionProvider = data?.applicationConnectionProviders.find(
    (connectionProvider) =>
      connectionProvider.id === connectionProviderId &&
      connectionProvider.scope === ConnectionProviderScope.USER,
  );

  if (isDefined(perMemberConnectionProvider)) {
    return (
      <SettingsMcpServerConnectionsSection
        mcpServerId={mcpServerId}
        connectionProvider={perMemberConnectionProvider}
      />
    );
  }

  return isDefined(error) ? (
    <SettingsApplicationLoadErrorBanner
      message={t`The sign-in for this server could not be loaded. Check your connection and try again.`}
      onRetry={() => refetch().catch(() => undefined)}
    />
  ) : null;
};
