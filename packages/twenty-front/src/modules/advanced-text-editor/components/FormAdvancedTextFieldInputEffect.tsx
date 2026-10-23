import { isUndefined } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';

type FormAdvancedTextFieldInputEffectProps = {
  editor: Editor | null;
  value: string | null | undefined;
  readonly: boolean | undefined;
  parseLegacyDocument?: AdvancedTextEditorLegacyDocumentParser;
  onEditorReady?: (editor: Editor | null) => void;
};

export const FormAdvancedTextFieldInputEffect = ({
  editor,
  value,
  readonly,
  parseLegacyDocument,
  onEditorReady,
}: FormAdvancedTextFieldInputEffectProps) => {
  useEffect(() => {
    onEditorReady?.(editor);

    return () => {
      onEditorReady?.(null);
    };
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!isDefined(editor) || editor.isDestroyed) {
      return;
    }

    editor.setEditable(!readonly, false);
  }, [editor, readonly]);

  useEffect(() => {
    if (!isDefined(editor) || editor.isDestroyed || isUndefined(value)) {
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
  }, [editor, value, parseLegacyDocument]);

  return null;
};
