import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { VIEW_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { documentHtmlPage } from 'src/utils/render-document';

const htmlResponse = (html: string, status = 200): Response =>
  new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });

// Renders a generated document as a standalone, printable web page.
// Open it at: <server>/s/documents/view?id=<documentId>
const handler = async (event: RoutePayload): Promise<Response> => {
  const documentId = event.queryStringParameters?.id;

  if (!documentId) {
    return htmlResponse(
      documentHtmlPage('Missing document id', 'Provide ?id=<documentId>.'),
      400,
    );
  }

  const client = new CoreApiClient();

  // Filtered list query so an unknown id renders a clean 404 page instead of
  // throwing.
  const { documents } = await client.query({
    documents: {
      __args: { filter: { id: { eq: documentId } }, first: 1 },
      edges: {
        node: { id: true, name: true, content: true },
      },
    },
  });

  const document = documents?.edges?.[0]?.node;

  if (!document?.id) {
    return htmlResponse(
      documentHtmlPage('Document not found', `No document with id ${documentId}.`),
      404,
    );
  }

  return htmlResponse(
    documentHtmlPage(document.name ?? 'Document', document.content ?? ''),
  );
};

export default defineLogicFunction({
  universalIdentifier: VIEW_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'view-document',
  description: 'Renders a generated document as a printable HTML page.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/documents/view',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
