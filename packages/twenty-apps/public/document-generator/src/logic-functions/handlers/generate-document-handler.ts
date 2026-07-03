import { CoreApiClient } from 'twenty-client-sdk/core';

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
      message: 'Both templateId and recordId are required.',
    };
  }

  const client = new CoreApiClient();

  const { documentTemplate } = await client.query({
    documentTemplate: {
      __args: { filter: { id: { eq: templateId } } },
      id: true,
      name: true,
      body: true,
      target: true,
    },
  });

  if (!documentTemplate?.id) {
    return {
      success: false,
      message: `No document template found with id ${templateId}.`,
    };
  }

  const target = documentTemplate.target ?? '';

  if (!isSupportedTarget(target)) {
    return {
      success: false,
      message: `Template target "${target}" is not supported.`,
    };
  }

  const record = await loadRecordValues(client, target, recordId);

  if (!record.found) {
    return {
      success: false,
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
          status: 'GENERATED',
          templateId: documentTemplate.id,
        },
      },
      id: true,
      name: true,
    },
  });

  if (!createDocument?.id) {
    return { success: false, message: 'Failed to create the document.' };
  }

  return {
    success: true,
    message: `Generated "${createDocument.name}".`,
    documentId: createDocument.id,
    content,
    missingTokens,
  };
};
