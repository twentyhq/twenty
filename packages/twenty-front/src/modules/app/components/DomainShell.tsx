import { BrowserRouter } from 'react-router-dom';

import { RootApp } from '@/app/components/RootApp';
import { SharedAppProviders } from '@/app/components/SharedAppProviders';
import { WorkspaceApp } from '@/app/components/WorkspaceApp';
import { isOnOnboardingTransitionPath } from '@/auth/utils/isOnOnboardingTransitionPath';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { FrontDomainToDefaultDomainRedirectEffect } from '@/domain-manager/components/FrontDomainToDefaultDomainRedirectEffect';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const DomainShell = () => {
  const { isLoadedOnce } = useAtomStateValue(clientConfigApiStatusState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const { frontDomain } = useAtomStateValue(domainConfigurationState);

  // The bare front domain hosts no workspace in multi-workspace mode.
  const isOnBareFrontDomain =
    isLoadedOnce &&
    isMultiWorkspaceEnabled &&
    !isDefaultDomain &&
    window.location.hostname === frontDomain;

  if (!isLoadedOnce || isOnBareFrontDomain) {
    return (
      <BrowserRouter useTransitions={false}>
        <SharedAppProviders>
          {isOnBareFrontDomain && <FrontDomainToDefaultDomainRedirectEffect />}
          {isOnOnboardingTransitionPath(window.location.pathname) ? (
            <OnboardingPageLoader />
          ) : (
            <UserOrMetadataLoader />
          )}
        </SharedAppProviders>
      </BrowserRouter>
    );
  }

  if (!isMultiWorkspaceEnabled) {
    return <WorkspaceApp />;
  }

  return isDefaultDomain ? <RootApp /> : <WorkspaceApp />;
};
