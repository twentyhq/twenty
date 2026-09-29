import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { Trans, useLingui } from '@lingui/react/macro';
import { Suspense, lazy } from 'react';
import { AppPath } from 'twenty-shared/types';

const BackgroundMockPage = lazy(() =>
  import('@/sign-in-background-mock/components/BackgroundMockPage').then(
    (module) => ({ default: module.BackgroundMockPage }),
  ),
);

import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { styled } from '@linaria/react';
import { MainButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBackDrop = styled.div`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.light};
  background: ${themeCssVariables.background.transparent.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: ${RootStackingContextZIndices.NotFound};
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

export const NotFound = () => {
  const { t } = useLingui();

  return (
    <>
      <PageTitle title={t`Page Not Found | Twenty`} />
      <StyledBackDrop>
        <ErrorState.Root>
          <AnimatedPlaceholder type="error404" />
          <EmptyState.Content>
            <ErrorState.Title>
              <Trans>Off the beaten path</Trans>
            </ErrorState.Title>
            <ErrorState.Description>
              <Trans>
                The page you're seeking is either gone or never was. Let's get
                you back on track
              </Trans>
            </ErrorState.Description>
          </EmptyState.Content>
          <StyledButtonContainer>
            <NavigationButton
              buttonComponent={MainButton}
              to={AppPath.Index}
              fullWidth
            >{t`Back to content`}</NavigationButton>
          </StyledButtonContainer>
        </ErrorState.Root>
      </StyledBackDrop>
      <Suspense fallback={null}>
        <BackgroundMockPage />
      </Suspense>
    </>
  );
};
