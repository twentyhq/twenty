import { t } from '@lingui/core/macro';
import { getOperationAST, OperationTypeNode, parse } from 'graphql';
import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { z } from 'zod';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

const metadataQueryBody = z.object({ query: z.string() });

export const fetchFrontComponentPreviewMetadataQuery = async ({
  body,
  getApplicationAccessToken,
}: {
  body: string;
  getApplicationAccessToken: () => Promise<string>;
}) => {
  const { query } = metadataQueryBody.parse(JSON.parse(body));

  // SDK selection names come from the worker. Check the final document before authorizing it.
  if (getOperationAST(parse(query))?.operation !== OperationTypeNode.QUERY) {
    throw new Error(t`Only Metadata API queries are available in previews.`);
  }

  return fetch(`${REACT_APP_SERVER_BASE_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getApplicationAccessToken()}`,
    },
    credentials: 'omit',
    redirect: 'error',
    body,
  });
};

export const createQueryFrontComponentPreviewMetadata =
  (
    getApplicationAccessToken: () => Promise<string>,
  ): MetadataApiClient['query'] =>
  async (selection) => {
    const { MetadataApiClient } = await import('twenty-client-sdk/metadata');
    const client = new MetadataApiClient({
      fetch: (_url: string, request: RequestInit) =>
        fetchFrontComponentPreviewMetadataQuery({
          body: z.string().parse(request.body),
          getApplicationAccessToken,
        }),
    });

    return client.query(selection);
  };
