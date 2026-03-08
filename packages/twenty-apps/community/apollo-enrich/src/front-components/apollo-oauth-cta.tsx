import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { OAuthApplicationVariables } from 'src/logic-functions/get-oauth-application-variables';
import { VERIFY_PAGE_PATH } from 'src/logic-functions/get-verify-page';
import { defineFrontComponent } from 'twenty-sdk';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const StyledSectionTitle = styled.h3`
  color: #333;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const StyledSectionSubtitle = styled.p`
  color: #818181;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  margin: 0 0 12px 0;
`;

const StyledCard = styled.div`
  align-items: center;
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  padding: 16px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledTextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledTitle = styled.span`
  color: #333;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
`;

const StyledDescription = styled.span`
  color: #818181;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
`;

const StyledLink = styled.a`
  align-items: center;
  background: #5e5adb;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  box-sizing: border-box;
  color: #fafafa;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  height: 32px;
  justify-content: center;
  padding: 0 12px;
  text-decoration: none;
  transition: background 0.1s ease;
  white-space: nowrap;

  &:hover {
    background: #4b47b8;
  }

  &:active {
    background: #3c3996;
  }

  &:focus {
    outline: none;
  }
`;

const StyledConnectedStatus = styled.span`
  align-items: center;
  background: #10b981;
  border-radius: 4px;
  color: #fff;
  display: inline-flex;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  white-space: nowrap;
`;

const StyledIcon = styled.img`
  height: 24px;
  width: 24px;
`;

const APOLLO_ICON_URL = 'https://twenty-icons.com/apollo.io';

const fetchOAuthApplicationVariables = async (): Promise<OAuthApplicationVariables> => {
  const backEndUrl = `${process.env.TWENTY_API_URL}/s/oauth/application-variables`;
  const response = await fetch(backEndUrl, {
    method: 'GET',
  });
  const data = await response.json();

  return data;
};

const buildOAuthUrl = (oauthApplicationVariables: OAuthApplicationVariables): string => {
  const { apolloOAuthUrl, apolloClientId, apolloRegisteredUrl } = oauthApplicationVariables;
  const redirectUri = `${apolloRegisteredUrl}auth/oauth-propagator/callback`;
  const state = encodeURIComponent(`${process.env.TWENTY_API_URL}/s${VERIFY_PAGE_PATH}`);
  return `${apolloOAuthUrl}?client_id=${apolloClientId}&redirect_uri=${redirectUri}&state=${state}&response_type=code`;
};

const ApolloOAuthCta = () => {
  const [oauthApplicationVariables, setOAuthApplicationVariables] =
    useState<OAuthApplicationVariables | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchOAuthApplicationVariables()
      .then(setOAuthApplicationVariables)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <StyledContainer>
        <StyledSectionTitle>Connect to Apollo</StyledSectionTitle>
        <StyledSectionSubtitle>Enrich your contacts with Apollo data</StyledSectionSubtitle>
        <StyledCard>
          <StyledIconContainer>
            <StyledIcon src={APOLLO_ICON_URL} alt="Apollo" />
          </StyledIconContainer>
          <StyledTextContainer>
            <StyledTitle>Apollo OAuth</StyledTitle>
            <StyledDescription>Loading...</StyledDescription>
          </StyledTextContainer>
        </StyledCard>
      </StyledContainer>
    );
  }

  if (error || !oauthApplicationVariables) {
    return null;
  }

  const isConnected = Boolean(oauthApplicationVariables.apolloAccessToken);
  const oauthUrl = buildOAuthUrl(oauthApplicationVariables);

  return (
    <StyledContainer>
      <StyledSectionTitle>Connect to Apollo</StyledSectionTitle>
      <StyledSectionSubtitle>Enrich your contacts with Apollo data</StyledSectionSubtitle>
      <StyledCard>
        <StyledIconContainer>
          <StyledIcon src={APOLLO_ICON_URL} alt="Apollo" />
        </StyledIconContainer>
        <StyledTextContainer>
          <StyledTitle>Apollo OAuth</StyledTitle>
          <StyledDescription>
            {isConnected
              ? 'Your Apollo account is connected'
              : 'Connect your Apollo account to enrich contacts'}
          </StyledDescription>
        </StyledTextContainer>
        {isConnected ? (
          <StyledConnectedStatus>
            ✓ Connected
          </StyledConnectedStatus>
        ) : (
          <StyledLink href={oauthUrl} rel="noopener noreferrer">
            Connect
          </StyledLink>
        )}
      </StyledCard>
    </StyledContainer>
  );
};

export default defineFrontComponent({
  universalIdentifier: '50d59f7c-eada-4731-aacd-8e45371e1040',
  name: 'apollo-oauth-cta',
  description: 'CTA button to connect to Apollo Enrichment via OAuth',
  component: ApolloOAuthCta,
});
