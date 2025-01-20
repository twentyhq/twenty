import { SignInBackgroundMockPage } from '@/sign-in-background-mock/components/SignInBackgroundMockPage';
import { AppPath } from '@/types/AppPath';
import { Trans, useLingui } from '@lingui/react/macro';

import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import styled from '@emotion/styled';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderErrorContainer,
  AnimatedPlaceholderErrorSubTitle,
  AnimatedPlaceholderErrorTitle,
  MainButton,
  UndecoratedLink,
} from 'twenty-ui';

const StyledBackDrop = styled.div`
  align-items: center;
  backdrop-filter: ${({ theme }) => theme.blur.light};
  background: ${({ theme }) => theme.background.transparent.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10000;
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

export const NotFound = () => {
  const { t } = useLingui();

  return (
    <>
      <PageTitle title={t`Page Not Found` + ' | Twenty'} />
      <StyledBackDrop>
        <AnimatedPlaceholderErrorContainer>
          <AnimatedPlaceholder type="error404" />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderErrorTitle>
              <Trans>Off the beaten path</Trans>
            </AnimatedPlaceholderErrorTitle>
            <AnimatedPlaceholderErrorSubTitle>
              <Trans>
                The page you're seeking is either gone or never was. Let's get
                you back on track
              </Trans>
            </AnimatedPlaceholderErrorSubTitle>
          </AnimatedPlaceholderEmptyTextContainer>
          <StyledButtonContainer>
            <UndecoratedLink to={AppPath.Index}>
              <MainButton title={t`Back to content`} fullWidth />
            </UndecoratedLink>
          </StyledButtonContainer>
        </AnimatedPlaceholderErrorContainer>
      </StyledBackDrop>
      <SignInBackgroundMockPage />
    </>
  );
};
