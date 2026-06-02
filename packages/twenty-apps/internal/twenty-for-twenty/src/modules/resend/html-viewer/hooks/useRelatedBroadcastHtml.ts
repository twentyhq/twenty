import { useEffect, useState } from 'react';
import { useRecordId } from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { isDefined } from '@utils/is-defined';

type RelatedBroadcastHtmlState = {
  html: string | null;
  loading: boolean;
  error: string | null;
  hasBroadcast: boolean;
};

type ResendEmailWithBroadcast = {
  broadcast?: { htmlBody?: string | null } | null;
};

export const useRelatedBroadcastHtml = (): RelatedBroadcastHtmlState => {
  const recordId = useRecordId();
  const [state, setState] = useState<RelatedBroadcastHtmlState>({
    html: null,
    loading: true,
    error: null,
    hasBroadcast: false,
  });

  useEffect(() => {
    if (!isDefined(recordId)) {
      setState({
        html: null,
        loading: false,
        error: 'No record ID',
        hasBroadcast: false,
      });
      return;
    }

    setState({ html: null, loading: true, error: null, hasBroadcast: false });

    new CoreApiClient()
      .query({
        resendEmail: {
          __args: { filter: { id: { eq: recordId } } },
          broadcast: {
            htmlBody: true,
          },
        },
      })
      .then((result: unknown) => {
        const record = (result as Record<string, unknown>).resendEmail as
          | ResendEmailWithBroadcast
          | null
          | undefined;

        if (!isDefined(record)) {
          setState({
            html: null,
            loading: false,
            error: 'Email not found',
            hasBroadcast: false,
          });
          return;
        }

        if (!isDefined(record.broadcast)) {
          setState({
            html: null,
            loading: false,
            error: null,
            hasBroadcast: false,
          });
          return;
        }

        setState({
          html: record.broadcast.htmlBody ?? null,
          loading: false,
          error: null,
          hasBroadcast: true,
        });
      })
      .catch((fetchError: unknown) => {
        setState({
          html: null,
          loading: false,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
          hasBroadcast: false,
        });
      });
  }, [recordId]);

  return state;
};
