import { CoreApiClient } from 'twenty-client-sdk/core';

import { DOCUMENT_STATUS_GENERATED } from 'src/constants/universal-identifiers';
import {
  isSupportedTarget,
  loadRecordValues,
} from 'src/logic-functions/utils/load-record-values';
import { renderTemplate } from 'src/logic-functions/utils/render-template';

export type GenerateDocumentInput = {
  templateId: string;
  recordId: string;
};

export type GenerateDocumentResult = {
  success: boolean;
  message: string;
  // Suggested HTTP status for the route trigger. Ignored by the tool and
  // workflow-action triggers, which only care about `success`.
  status?: number;
  documentId?: string;
  content?: string;
  missingTokens?: string[];
};

// Shared business logic behind every trigger (AI tool, workflow action, HTTP
// route). It loads a template + a CRM record, fills the placeholders, and
// stores the result as a `document` record.
export const generateDocumentHandler = async (
  input: GenerateDocumentInput,
): Promise<GenerateDocumentResult> => {
  const { templateId, recordId } = input;

  if (!templateId || !recordId) {
    return {
      success: false,
      status: 400,
      message: 'Both templateId and recordId are required.',
    };
  }

  const client = new CoreApiClient();

  // Use a filtered list query rather than the singular lookup: the singular
  // query throws when no record matches, which would surface as a 500 instead
  // of our intended 404.
  const { documentTemplates } = await client.query({
    documentTemplates: {
      __args: { filter: { id: { eq: templateId } }, first: 1 },
      edges: {
        node: { id: true, name: true, body: true, target: true },
      },
    },
  });

  const documentTemplate = documentTemplates?.edges?.[0]?.node;

  if (!documentTemplate?.id) {
    return {
      success: false,
      status: 404,
      message: `No document template found with id ${templateId}.`,
    };
  }

  const target = documentTemplate.target ?? '';

  if (!isSupportedTarget(target)) {
    return {
      success: false,
      status: 400,
      message: `Template target "${target}" is not supported.`,
    };
  }

  const record = await loadRecordValues(client, target, recordId);

  if (!record.found) {
    return {
      success: false,
      status: 404,
      message: `No ${target} found with id ${recordId}.`,
    };
  }

  const { content, missingTokens } = renderTemplate(
    documentTemplate.body ?? '',
    record.values,
  );

  const documentName = `${documentTemplate.name ?? 'Document'} — ${record.displayName}`;

  const { createDocument } = await client.mutation({
    createDocument: {
      __args: {
        data: {
          name: documentName,
          content,
          status: DOCUMENT_STATUS_GENERATED,
          templateId: documentTemplate.id,
        },
      },
      id: true,
      name: true,
    },
  });

  if (!createDocument?.id) {
    return {
      success: false,
      status: 500,
      message: 'Failed to create the document.',
    };
  }

  return {
    success: true,
    message: `Generated "${createDocument.name}".`,
    documentId: createDocument.id,
    content,
    missingTokens,
  };
};
