import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import { Font, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const registerInterFonts = (() => {
  let registrationPromise: Promise<void> | null = null;

  return () => {
    if (!registrationPromise) {
      registrationPromise = Promise.resolve().then(() => {
        Font.register({
          family: 'Inter',
          fonts: [
            {
              src: 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
              fontWeight: 400,
            },
            {
              src: 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf',
              fontWeight: 500,
            },
            {
              src: 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf',
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

  const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const blob = await pdf(pdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};
