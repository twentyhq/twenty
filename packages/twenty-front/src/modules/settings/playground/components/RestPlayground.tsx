import { apiKeyState } from '@/settings/playground/states/apiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { isValid } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilValue } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const ApiDocumentationSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton height={40} width="40%" />
        <Skeleton height={24} width="80%" count={3} />
        <Skeleton height={100} width="100%" />
        <Skeleton height={24} width="70%" count={2} />
        <Skeleton height={60} width="90%" />
        <Skeleton height={24} width="60%" count={4} />
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};

export const RestPlayground = ({ onError }: { onError(): void }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const [openAPIReference, setOpenAPIReference] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schema = PlaygroundSchemas.CORE; // TODO: get schema from url
  const apiKey = useRecoilValue(apiKeyState);

  useEffect(() => {
    const fetchOpenAPIReference = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${REACT_APP_SERVER_BASE_URL}/open-api/${schema}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.tags) {
          throw new Error('Invalid API response');
        }

        setOpenAPIReference(data);
        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : t`Failed to fetch API configuration`,
        );
        onError();
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenAPIReference();
  }, [apiKey, schema, t, onError]);

  if (!isValid) {
    onError();
    return null;
  }

  if (isLoading) {
    return <ApiDocumentationSkeletonLoader />;
  }

  if (error !== null || openAPIReference === null) {
    return <ApiDocumentationSkeletonLoader />;
  }

  const baseURL = REACT_APP_SERVER_BASE_URL + '/' + schema;

  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          content: openAPIReference,
        },
        authentication: {
          http: {
            basic: { username: '', password: '' },
            bearer: apiKey ? { token: apiKey } : undefined,
          },
        },
        baseServerURL: baseURL,
        forceDarkModeState: theme.name as 'dark' | 'light',
      }}
    />
  );
};
