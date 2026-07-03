import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { GENERATE_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateDocumentHandler } from 'src/logic-functions/handlers/generate-document-handler';

// HTTP entry point used by the "Generate document" front component. The shared
// handler returns a suggested HTTP status on failure (400/404/500); map it onto
// the response so callers get proper status codes instead of a 200 with an error.
const handler = async (event: RoutePayload): Promise<Response> => {
  const body = event.body as Record<string, unknown> | null;

  const result = await generateDocumentHandler({
    templateId: (body?.templateId as string | undefined) ?? '',
    recordId: (body?.recordId as string | undefined) ?? '',
  });

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : (result.status ?? 400),
    headers: { 'Content-Type': 'application/json' },
  });
};

export default defineLogicFunction({
  universalIdentifier: GENERATE_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'generate-document-route',
  description: 'HTTP endpoint that generates a document for the given record.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/documents/generate',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
