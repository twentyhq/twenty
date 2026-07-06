import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import {
  DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_STATUS_GENERATED,
} from 'src/constants/universal-identifiers';
import { generateDocumentPdf } from 'src/logic-functions/utils/generate-document-pdf';
import {
  isSupportedTarget,
  loadRecordValues,
} from 'src/logic-functions/utils/load-record-values';
import { renderTemplate } from 'src/logic-functions/utils/render-template';

// Builds a filesystem-safe PDF filename from the document name.
const toPdfFileName = (documentName: string): string => {
  const slug = documentName
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${slug || 'document'}.pdf`;
};

// Generates the PDF, uploads it to the app-owned `file` field, and stores the
// reference on the document so the record shows a downloadable PDF.
const attachGeneratedPdf = async (
  client: CoreApiClient,
  documentId: string,
  documentName: string,
  content: string,
): Promise<void> => {
  const bytes = await generateDocumentPdf(content);
  const fileName = toPdfFileName(documentName);

  const uploaded = await new MetadataApiClient().uploadFile(
    Buffer.from(bytes),
    fileName,
    'application/pdf',
    DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  await client.mutation({
    updateDocument: {
      __args: {
        id: documentId,
        data: { file: [{ fileId: uploaded.id, label: fileName }] },
      },
      id: true,
    },
  });
};

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
        // `body` is a RICH_TEXT field: request its Markdown projection. The
        // generated client only types the composite after
        // `twenty dev:generate-client` is re-run against a remote that has this
        // field; until then the cast bridges the lag (drop it after regen).
        node: {
          id: true,
          name: true,
          target: true,
          body: { markdown: true } as unknown as true,
        },
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

  // RICH_TEXT stores { blocknote, markdown }; the Markdown projection feeds the
  // existing placeholder + PDF/HTML pipeline unchanged.
  const bodyMarkdown =
    (documentTemplate.body as unknown as { markdown: string | null } | null)
      ?.markdown ?? '';

  const { content, missingTokens } = renderTemplate(bodyMarkdown, record.values);

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

  // Best-effort: the document already exists, so a PDF/upload failure shouldn't
  // discard it — surface a warning instead.
  let message = `Generated "${createDocument.name}".`;

  try {
    await attachGeneratedPdf(
      client,
      createDocument.id,
      createDocument.name ?? documentName,
      content,
    );
  } catch (error) {
    // Log the real cause server-side, but keep the caller-facing message
    // generic — this handler is exposed via HTTP, AI tool, and workflow action.
    console.warn('[document-generator] PDF attachment failed:', error);
    message += ' (PDF file could not be attached)';
  }

  return {
    success: true,
    message,
    documentId: createDocument.id,
    content,
    missingTokens,
  };
};
