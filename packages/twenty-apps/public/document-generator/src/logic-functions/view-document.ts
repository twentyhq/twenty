import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { VIEW_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { renderDocumentHtml } from 'src/logic-functions/utils/render-document-html';

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
      renderDocumentHtml('Missing document id', 'Provide ?id=<documentId>.'),
      400,
    );
  }

  const client = new CoreApiClient();

  const { document } = await client.query({
    document: {
      __args: { filter: { id: { eq: documentId } } },
      id: true,
      name: true,
      content: true,
    },
  });

  if (!document?.id) {
    return htmlResponse(
      renderDocumentHtml('Document not found', `No document with id ${documentId}.`),
      404,
    );
  }

  return htmlResponse(
    renderDocumentHtml(document.name ?? 'Document', document.content ?? ''),
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
