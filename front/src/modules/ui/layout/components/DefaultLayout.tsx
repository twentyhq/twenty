import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { AuthModal } from '@/auth/components/Modal';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { NavbarAnimatedContainer } from '@/ui/navbar/components/NavbarAnimatedContainer';
import { MOBILE_VIEWPORT } from '@/ui/themes/themes';
import { AppNavbar } from '~/AppNavbar';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { CompaniesMockMode } from '~/pages/companies/CompaniesMockMode';

import { AppPath } from '../../../types/AppPath';
import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: row;
  height: 100vh;
  position: relative;
  width: 100vw;
`;

const NAVBAR_WIDTH = '236px';

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  width: ${() =>
    useRecoilValue(isNavbarOpenedState)
      ? `calc(100% - ${NAVBAR_WIDTH})`
      : '100%'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(isNavbarOpenedState) ? '0' : '100%')};
  }
`;

type OwnProps = {
  children: JSX.Element;
};

export function DefaultLayout({ children }: OwnProps) {
  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();

  const onboardingStatus = useOnboardingStatus();
  useEffect(() => {
    if (onboardingStatus === OnboardingStatus.OngoingUserCreation) {
      if (
        !isMatchingLocation(AppPath.SignIn) &&
        !isMatchingLocation(AppPath.SignIn) &&
        !isMatchingLocation(AppPath.Invite) &&
        !isMatchingLocation(AppPath.Verify)
      ) {
        navigate(AppPath.SignIn);
      }
    } else if (onboardingStatus === OnboardingStatus.OngoingWorkspaceCreation) {
      if (!isMatchingLocation(AppPath.CreateWorkspace)) {
        navigate(AppPath.CreateWorkspace);
      }
    } else if (onboardingStatus === OnboardingStatus.OngoingProfileCreation) {
      if (!isMatchingLocation(AppPath.CreateProfile)) {
        navigate(AppPath.CreateProfile);
      }
    } else if (onboardingStatus === OnboardingStatus.Completed) {
      if (
        isMatchingLocation(AppPath.SignIn) ||
        isMatchingLocation(AppPath.SignIn) ||
        isMatchingLocation(AppPath.Invite) ||
        isMatchingLocation(AppPath.Verify) ||
        isMatchingLocation(AppPath.CreateWorkspace) ||
        isMatchingLocation(AppPath.CreateProfile)
      ) {
        navigate('/');
      }
    }
  }, [onboardingStatus, navigate, isMatchingLocation]);

  return (
    <StyledLayout>
      <>
        <CommandMenu />
        <NavbarAnimatedContainer>
          <AppNavbar />
        </NavbarAnimatedContainer>
        <MainContainer>
          {onboardingStatus &&
          onboardingStatus !== OnboardingStatus.Completed ? (
            <>
              <CompaniesMockMode />
              <AnimatePresence mode="wait">
                <LayoutGroup>
                  <AuthModal>{children}</AuthModal>
                </LayoutGroup>
              </AnimatePresence>
            </>
          ) : (
            <>{children}</>
          )}
        </MainContainer>
      </>
    </StyledLayout>
  );
}
