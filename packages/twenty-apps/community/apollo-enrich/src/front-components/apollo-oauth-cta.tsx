import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { OAuthApplicationVariables } from 'src/logic-functions/get-oauth-application-variables';
import { VERIFY_PAGE_PATH } from 'src/logic-functions/get-verify-page';
import { defineFrontComponent } from 'twenty-sdk';

const StyledLink = styled.a`
  align-items: center;
  background: #5e5adb;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  box-sizing: border-box;
  color: #fafafa;
  cursor: pointer;
  display: inline-flex;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  height: 32px;
  justify-content: center;
  padding: 0 8px;
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
    return <StyledLink as="span">Loading...</StyledLink>;
  }

  if (error || !oauthApplicationVariables) {
    return null;
  }

  const oauthUrl = buildOAuthUrl(oauthApplicationVariables);

  return (
    <StyledLink
      href={oauthUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Connect to Apollo
    </StyledLink>
  );
};

export default defineFrontComponent({
  universalIdentifier: '50d59f7c-eada-4731-aacd-8e45371e1040',
  name: 'apollo-oauth-cta',
  description: 'CTA button to connect to Apollo Enrichment via OAuth',
  component: ApolloOAuthCta,
});
