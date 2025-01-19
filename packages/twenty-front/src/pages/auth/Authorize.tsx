import { AppPath } from '@/types/AppPath';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useLingui } from '@lingui/react/macro';
import { MainButton, UndecoratedLink } from 'twenty-ui';
import { useAuthorizeAppMutation } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isDefined } from '~/utils/isDefined';

type App = { id: string; name: string; logo: string };

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100dvh;
  justify-content: center;
  width: 100%;
`;

const StyledAppsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => theme.spacing(6)} 0px;
`;

const StyledCardWrapper = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.background.primary};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  padding: ${({ theme }) => theme.spacing(6)};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
`;
export const Authorize = () => {
  const { t } = useLingui();
  const navigate = useNavigateApp();
  const [searchParam] = useSearchParams();
  const { redirect } = useRedirect();
  //TODO: Replace with db call for registered third party apps
  const [apps] = useState<App[]>([
    {
      id: 'chrome',
      name: 'Chrome Extension',
      logo: 'images/integrations/chrome-icon.svg',
    },
  ]);
  const [app, setApp] = useState<App>();
  const clientId = searchParam.get('clientId');
  const codeChallenge = searchParam.get('codeChallenge');
  const redirectUrl = searchParam.get('redirectUrl');

  useEffect(() => {
    const app = apps.find((app) => app.id === clientId);
    if (!isDefined(app)) navigate(AppPath.NotFound);
    else setApp(app);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [authorizeApp] = useAuthorizeAppMutation();
  const handleAuthorize = async () => {
    if (
      isDefined(clientId) &&
      isDefined(codeChallenge) &&
      isDefined(redirectUrl)
    ) {
      await authorizeApp({
        variables: {
          clientId,
          codeChallenge,
          redirectUrl,
        },
        onCompleted: (data) => {
          redirect(data.authorizeApp.redirectUrl);
        },
      });
    }
  };

  return (
    <StyledContainer>
      <StyledCardWrapper>
        <StyledAppsContainer>
          <img
            src="/images/integrations/twenty-logo.svg"
            alt="twenty-icon"
            height={40}
            width={40}
          />
          <img
            src="/images/integrations/link-apps.svg"
            alt="link-icon"
            height={60}
            width={60}
          />
          <img src={app?.logo} alt="app-icon" height={40} width={40} />
        </StyledAppsContainer>
        <StyledText>{app?.name} wants to access your account</StyledText>
        <StyledButtonContainer>
          <UndecoratedLink to={AppPath.Index}>
            <MainButton title={t`Cancel`} variant="secondary" fullWidth />
          </UndecoratedLink>
          <MainButton
            title={t`Authorize`}
            onClick={handleAuthorize}
            fullWidth
          />
        </StyledButtonContainer>
      </StyledCardWrapper>
    </StyledContainer>
  );
};
