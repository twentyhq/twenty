import { type PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { useEffect, useRef } from 'react';
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
  // Read callbacks from refs so unstable parent functions don't retrigger
  // the fetch (which would clear the schema and flicker the UI).
  const onSchemaLoadedRef = useRef(onSchemaLoaded);
  const onErrorRef = useRef(onError);
  onSchemaLoadedRef.current = onSchemaLoaded;
  onErrorRef.current = onError;

  useEffect(() => {
    onSchemaLoadedRef.current(null);

    const abortController = new AbortController();

    fetch(`${REACT_APP_SERVER_BASE_URL}/rest/open-api/${schema}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: abortController.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((document) => onSchemaLoadedRef.current(document))
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          onErrorRef.current();
        }
      });

    return () => abortController.abort();
  }, [schema, apiKey]);

  return null;
};
