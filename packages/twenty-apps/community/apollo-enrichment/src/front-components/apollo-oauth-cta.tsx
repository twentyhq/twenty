import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
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

const buildOAuthUrl = async (): Promise<string> => {
  const backEndUrl = `${process.env.TWENTY_API_URL}/s/oauth/url`;
  console.log('backEndUrl', backEndUrl);
  const response = await fetch(backEndUrl, {
    method: 'GET',
  });
  const data = await response.json();

  return data.url;
};

const ApolloOAuthCta = () => {

  const [oauthUrl, setOAuthUrl] = useState<string | null>(null);
  useEffect(() => {
    buildOAuthUrl().then((url) => {
      setOAuthUrl(url);
    });
  }, []);
  return (
    <StyledLink
      href={oauthUrl ?? ''}
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
