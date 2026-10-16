import { BlockNoteEditor, type PartialBlock } from '@blocknote/core';
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

export const exportBlockNoteEditorToPdf = async (
  parsedBody: PartialBlock[],
  filename: string,
) => {
  const editor = BlockNoteEditor.create({
    initialContent: parsedBody,
  });

  const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings, {
    resolveFileUrl: async (url: string) => {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(
            // oxlint-disable-next-line lingui/no-unlocalized-strings -- This asset-fetch failure is an export diagnostic.
            `Failed to fetch asset at ${url}: ${response.status} ${response.statusText}`,
          );
        }

        return await response.blob();
      } catch (error) {
        if (
          error instanceof Error &&
          // oxlint-disable-next-line lingui/no-unlocalized-strings -- This discriminator must match the diagnostic emitted above.
          error.message.includes('Failed to fetch asset')
        ) {
          throw error;
        }
        throw new Error(
          // oxlint-disable-next-line lingui/no-unlocalized-strings -- This asset-fetch failure is an export diagnostic.
          `Failed to fetch asset at ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
  });

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const blob = await pdf(pdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};
