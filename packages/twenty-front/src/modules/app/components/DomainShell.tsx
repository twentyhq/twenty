import { BrowserRouter } from 'react-router-dom';

import { AdminConsoleApp } from '@/app/components/AdminConsoleApp';
import { RootApp } from '@/app/components/RootApp';
import { SharedAppProviders } from '@/app/components/SharedAppProviders';
import { WorkspaceApp } from '@/app/components/WorkspaceApp';
import { isOnOnboardingTransitionPath } from '@/auth/utils/isOnOnboardingTransitionPath';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnAdminConsole } from '@/domain-manager/hooks/useIsCurrentLocationOnAdminConsole';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const DomainShell = () => {
  const { isLoadedOnce } = useAtomStateValue(clientConfigApiStatusState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const { isOnAdminConsole } = useIsCurrentLocationOnAdminConsole();

  if (!isLoadedOnce) {
    return (
      <BrowserRouter useTransitions={false}>
        <SharedAppProviders>
          {isOnOnboardingTransitionPath(window.location.pathname) ? (
            <OnboardingPageLoader />
          ) : (
            <UserOrMetadataLoader />
          )}
        </SharedAppProviders>
      </BrowserRouter>
    );
  }

  if (isOnAdminConsole) {
    return <AdminConsoleApp />;
  }

  if (!isMultiWorkspaceEnabled) {
    return <WorkspaceApp />;
  }

  return isDefaultDomain ? <RootApp /> : <WorkspaceApp />;
};
