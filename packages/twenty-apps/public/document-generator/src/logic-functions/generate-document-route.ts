import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { GENERATE_DOCUMENT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateDocumentHandler } from 'src/logic-functions/handlers/generate-document-handler';

// HTTP entry point used by the "Generate document" front component.
const handler = async (event: RoutePayload) => {
  const body = event.body as Record<string, unknown> | null;

  return generateDocumentHandler({
    templateId: (body?.templateId as string | undefined) ?? '',
    recordId: (body?.recordId as string | undefined) ?? '',
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
