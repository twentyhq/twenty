import { BlockNoteEditor, type PartialBlock } from '@blocknote/core';
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import { Font, pdf } from '@react-pdf/renderer';
import { cloneElement } from 'react';
import { saveAs } from 'file-saver';
import { isRtlLocale } from 'twenty-shared/utils';

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

const registerVazirmatnFonts = (() => {
  let registrationPromise: Promise<void> | null = null;

  return () => {
    if (!registrationPromise) {
      registrationPromise = Promise.resolve().then(() => {
        Font.register({
          family: 'Vazirmatn',
          fonts: [
            {
              src: 'https://fonts.gstatic.com/s/vazirmatn/v15/Dxx78j6PP2D_kU2muijPEe1n2vVbfJRklWgzORc.ttf',
              fontWeight: 400,
            },
            {
              src: 'https://fonts.gstatic.com/s/vazirmatn/v15/Dxx78j6PP2D_kU2muijPEe1n2vVbfJRklVozORc.ttf',
              fontWeight: 500,
            },
            {
              src: 'https://fonts.gstatic.com/s/vazirmatn/v15/Dxx78j6PP2D_kU2muijPEe1n2vVbfJRklbY0ORc.ttf',
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
  locale: string,
) => {
  const rtl = isRtlLocale(locale);

  await registerInterFonts();
  if (rtl) {
    await registerVazirmatnFonts();
  }

  const editor = BlockNoteEditor.create({
    initialContent: parsedBody,
  });

  const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const styledPdfDocument = cloneElement(pdfDocument, {
    style: {
      fontFamily: rtl ? 'Vazirmatn' : 'Inter',
      direction: rtl ? 'rtl' : 'ltr',
    },
  });

  const blob = await pdf(styledPdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};
