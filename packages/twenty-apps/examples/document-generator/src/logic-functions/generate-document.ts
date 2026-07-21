import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-sdk/logic-function';

import { GENERATE_DOCUMENT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateDocumentHandler } from 'src/logic-functions/handlers/generate-document-handler';
import { generateDocumentInputSchema } from 'src/logic-functions/schemas/generate-document-input.schema';

// Same function, exposed two ways:
//  - as an AI tool, so agents can call it,
//  - as a workflow action, so it can be dropped into the visual workflow builder.
export default defineLogicFunction({
  universalIdentifier: GENERATE_DOCUMENT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-document',
  description:
    'Generate a document from a template and a CRM record, filling the template placeholders with the record data.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: generateDocumentInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Generate Document',
    icon: 'IconFileText',
    inputSchema: jsonSchemaToInputSchema(generateDocumentInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          documentId: { type: 'string' },
          content: { type: 'string' },
          missingTokens: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  },
  handler: generateDocumentHandler,
});
