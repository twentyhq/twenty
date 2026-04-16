import { useCallback, useEffect, useState } from 'react';
import { useRecordId } from 'twenty-sdk';
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

  const fetchRecord = useCallback(async () => {
    if (!isDefined(recordId)) {
      setState({ html: null, loading: false, error: 'No record ID' });
      return;
    }

    const client = new CoreApiClient();

    try {
      const result = await client.query({
        [objectName]: {
          __args: {
            filter: { id: { eq: recordId } },
          },
          htmlBody: true,
        },
      });

      const record = (result as Record<string, unknown>)?.[objectName] as
        | { htmlBody?: string | null }
        | undefined;

      if (!isDefined(record)) {
        setState({ html: null, loading: false, error: 'Record not found' });
      } else {
        setState({
          html: record.htmlBody ?? null,
          loading: false,
          error: null,
        });
      }
    } catch (fetchError) {
      setState({
        html: null,
        loading: false,
        error:
          fetchError instanceof Error
            ? fetchError.message
            : String(fetchError),
      });
    }
  }, [recordId, objectName]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return state;
};
