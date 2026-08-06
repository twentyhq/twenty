import { BlockNoteEditor, type PartialBlock } from '@blocknote/core';
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import { Font, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
// Not @fontsource/inter, which the app itself uses: it splits Inter into
// per-script files picked by unicode-range, while Font.register takes one file
// per weight, so a Cyrillic or Greek note would export with missing glyphs.
// They must stay TTF too: fontkit parses woff2, but @react-pdf's subsetter
// crashes on the transformed glyf table woff2 stores.
import interRegularUrl from '~/assets/fonts/inter-400.ttf?url';
import interMediumUrl from '~/assets/fonts/inter-500.ttf?url';
import interSemiBoldUrl from '~/assets/fonts/inter-600.ttf?url';

const registerInterFonts = (() => {
  let registrationPromise: Promise<void> | null = null;

  return () => {
    if (!registrationPromise) {
      registrationPromise = Promise.resolve().then(() => {
        Font.register({
          family: 'Inter',
          fonts: [
            {
              src: interRegularUrl,
              fontWeight: 400,
            },
            {
              src: interMediumUrl,
              fontWeight: 500,
            },
            {
              src: interSemiBoldUrl,
              fontWeight: 600,
            },
          ],
        });
      });
    }
    return registrationPromise;
  };
})();

export const exportBlockNoteEditorToPdf = async (
  parsedBody: PartialBlock[],
  filename: string,
) => {
  await registerInterFonts();

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
            `Failed to fetch asset at ${url}: ${response.status} ${response.statusText}`,
          );
        }

        return await response.blob();
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Failed to fetch asset')
        ) {
          throw error;
        }
        throw new Error(
          `Failed to fetch asset at ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
  });

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const blob = await pdf(pdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};
