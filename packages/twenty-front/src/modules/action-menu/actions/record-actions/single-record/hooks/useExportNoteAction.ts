import { SingleRecordActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { BlockNoteEditor } from '@blocknote/core';

import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import * as ReactPDF from '@react-pdf/renderer';
import { Buffer } from 'buffer';
import { saveAs } from 'file-saver';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

// Polyfill needed for exportNoteToDocX
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const exportNoteToPdf = async (editor: BlockNoteEditor, filename: string) => {
  const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const blob = await ReactPDF.pdf(pdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};

// const exportNoteToDocx = async (editor: BlockNoteEditor, filename: string) => {
//   const exporter = new DOCXExporter(editor.schema, docxDefaultSchemaMappings);

//   const docxDocument = await exporter.`toDocxJsDocument(editor.document);

//   const blob = await Packer.toBlob(do`cxDocument);
//   saveAs(blob, `${filename}.docx`);
// };

export const useExportNoteAction: SingleRecordActionHookWithObjectMetadataItem =
  ({ recordId, objectMetadataItem }) => {
    const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

    const filename = `${selectedRecord?.title || 'Untitled Note'}`;

    const isNoteOrTask =
      objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
      objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

    const shouldBeRegistered =
      isDefined(objectMetadataItem) &&
      isDefined(selectedRecord) &&
      isNoteOrTask;

    const onClick = async () => {
      if (!shouldBeRegistered || !selectedRecord?.body) {
        return;
      }

      const editor = await BlockNoteEditor.create({
        initialContent: JSON.parse(selectedRecord.body),
      });

      await exportNoteToPdf(editor, filename);

      // TODO: Implement a Modal? to choose the export format between PDF and DOCX
      // await exportNoteToDocx(editor, filename);
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
