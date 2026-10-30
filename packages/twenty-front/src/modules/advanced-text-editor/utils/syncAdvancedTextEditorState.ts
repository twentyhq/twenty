import { isUndefined } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';

import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';

export const syncAdvancedTextEditorState = ({
  editor,
  value,
  readonly,
  parseLegacyDocument,
}: {
  editor: Editor;
  value: string | null | undefined;
  readonly: boolean | undefined;
  parseLegacyDocument?: AdvancedTextEditorLegacyDocumentParser;
}) => {
  if (editor.isDestroyed) {
    return;
  }

  const isEditable = !readonly;

  if (editor.isEditable !== isEditable) {
    editor.setEditable(isEditable, false);
  }

  if (isUndefined(value)) {
    return;
  }

  const serializedDocument = value ?? '';

  if (serializeAdvancedTextEditorDocument(editor) === serializedDocument) {
    return;
  }

  const content = deserializeAdvancedTextEditorDocument({
    serializedDocument,
    parseLegacyDocument,
  });

  editor.commands.setContent(content, { emitUpdate: false });
};
