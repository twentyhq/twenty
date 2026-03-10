import { type BlockNoteEditor } from '@blocknote/core';
import {
  docxDefaultSchemaMappings,
  DOCXExporter,
} from '@blocknote/xl-docx-exporter';
import { saveAs } from 'file-saver';

export const exportBlockNoteEditorToDocx = async (
  editor: BlockNoteEditor,
  filename: string,
) => {
  const exporter = new DOCXExporter(editor.schema, docxDefaultSchemaMappings);

  const blob = await exporter.toBlob(editor.document);
  saveAs(blob, `${filename}.docx`);
};
