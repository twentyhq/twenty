import { ApolloProvider } from '@/apollo/components/ApolloProvider';
import { RootApp } from '@/app/components/RootApp';
import { WorkspaceApp } from '@/app/components/WorkspaceApp';
import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

const DomainShellContent = () => {
  const { isLoadedOnce } = useAtomStateValue(clientConfigApiStatusState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  if (!isLoadedOnce) {
    return <UserOrMetadataLoader />;
  }

  if (!isMultiWorkspaceEnabled) {
    return <WorkspaceApp />;
  }

  return isDefaultDomain ? <RootApp /> : <WorkspaceApp />;
};

export const DomainShell = () => {
  return (
    <ApolloProvider>
      <BaseThemeProvider>
        <ClientConfigProviderEffect />
        <ClientConfigProvider>
          <DomainShellContent />
        </ClientConfigProvider>
      </BaseThemeProvider>
    </ApolloProvider>
  );
};
