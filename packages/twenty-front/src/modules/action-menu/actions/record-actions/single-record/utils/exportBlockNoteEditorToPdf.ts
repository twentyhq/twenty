import { BlockNoteEditor } from '@blocknote/core';
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import * as ReactPDF from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

export const exportBlockNoteEditorToPdf = async (
  editor: BlockNoteEditor,
  filename: string,
) => {
  const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const blob = await ReactPDF.pdf(pdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};
