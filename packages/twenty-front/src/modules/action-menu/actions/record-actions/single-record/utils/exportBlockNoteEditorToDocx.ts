import { type BlockNoteEditor } from '@blocknote/core';

import {
  docxDefaultSchemaMappings,
  DOCXExporter,
} from '@blocknote/xl-docx-exporter';
import { Buffer } from 'buffer';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';

export const exportBlockNoteEditorToDocx = async (
  editor: BlockNoteEditor,
  filename: string,
) => {
  // Polyfill needed for exportBlockNoteEditorToDocX
  if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
  }

  const exporter = new DOCXExporter(editor.schema, docxDefaultSchemaMappings);

  const docxDocument = await exporter.toDocxJsDocument(editor.document);

  const blob = await Packer.toBlob(docxDocument);
  saveAs(blob, `${filename}.docx`);
};
