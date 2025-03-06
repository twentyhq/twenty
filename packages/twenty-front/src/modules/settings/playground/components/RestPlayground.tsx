import { usePlaygroundSession } from '@/settings/playground/hooks/usePlaygroundSession';
import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundConfig';
import { useLingui } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const RestPlayground = ({ onError }: { onError(): void }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const [openAPIReference, setOpenAPIReference] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isValid, apiKey, baseUrl, schema } = usePlaygroundSession(
    PlaygroundTypes.REST,
  );

  useEffect(() => {
    const fetchOpenAPIReference = async () => {
      if (!isValid) {
        return;
      }

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
  }, [isValid, apiKey, schema, t, onError]);

  if (!isValid) {
    onError();
    return null;
  }

  if (isLoading) {
    return <div>{t`Loading API documentation...`}</div>;
  }

  if (error !== null || openAPIReference === null) {
    return <div>{error || t`Failed to load API documentation`}</div>;
  }

  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          content: openAPIReference,
        },
        authentication: {
          http: {
            basic: { username: '', password: '' },
            bearer: { token: apiKey },
          },
        },
        baseServerURL: baseUrl,
        forceDarkModeState: theme.name as 'dark' | 'light',
      }}
    />
  );
};
