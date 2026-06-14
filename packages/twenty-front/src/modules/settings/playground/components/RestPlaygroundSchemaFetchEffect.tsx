import { type PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { useEffect } from 'react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type RestPlaygroundSchemaFetchEffectProps = {
  schema: PlaygroundSchemas;
  apiKey: string;
  onSchemaLoaded: (document: object | null) => void;
  onError: () => void;
};

// Fetch via header so the token is never in a URL (logs, history, Referer).
export const RestPlaygroundSchemaFetchEffect = ({
  schema,
  apiKey,
  onSchemaLoaded,
  onError,
}: RestPlaygroundSchemaFetchEffectProps) => {
  useEffect(() => {
    onSchemaLoaded(null);

    const abortController = new AbortController();

    fetch(`${REACT_APP_SERVER_BASE_URL}/rest/open-api/${schema}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: abortController.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(onSchemaLoaded)
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          onError();
        }
      });

    return () => abortController.abort();
  }, [schema, apiKey, onSchemaLoaded, onError]);

  return null;
};
