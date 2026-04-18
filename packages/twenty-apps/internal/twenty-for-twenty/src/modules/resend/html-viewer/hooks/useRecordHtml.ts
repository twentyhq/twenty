import { useEffect, useState } from 'react';
import { useRecordId } from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

type RecordHtmlState = {
  html: string | null;
  loading: boolean;
  error: string | null;
};

export const useRecordHtml = (objectName: string): RecordHtmlState => {
  const recordId = useRecordId();
  const [state, setState] = useState<RecordHtmlState>({
    html: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isDefined(recordId)) {
      setState({ html: null, loading: false, error: 'No record ID' });
      return;
    }

    setState({ html: null, loading: true, error: null });

    new CoreApiClient()
      .query({
        [objectName]: {
          __args: { filter: { id: { eq: recordId } } },
          htmlBody: true,
        },
      })
      .then((result) => {
        const record = (result as Record<string, unknown>)[objectName] as
          | { htmlBody?: string | null }
          | undefined;

        setState(
          isDefined(record)
            ? { html: record.htmlBody ?? null, loading: false, error: null }
            : { html: null, loading: false, error: 'Record not found' },
        );
      })
      .catch((fetchError: unknown) => {
        setState({
          html: null,
          loading: false,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
        });
      });
  }, [recordId, objectName]);

  return state;
};
