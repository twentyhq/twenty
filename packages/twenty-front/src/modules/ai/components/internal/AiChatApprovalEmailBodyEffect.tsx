import { type Editor } from '@tiptap/core';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';

type AiChatApprovalEmailBodyEffectProps = {
  editor: Editor | null;
  body: string;
  disabled: boolean;
  label: string;
};

export const AiChatApprovalEmailBodyEffect = ({
  editor,
  body,
  disabled,
  label,
}: AiChatApprovalEmailBodyEffectProps) => {
  useEffect(() => {
    if (!isDefined(editor) || editor.isDestroyed) {
      return;
    }

    editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  useEffect(() => {
    if (!isDefined(editor) || editor.isDestroyed) {
      return;
    }

    editor.view.dom.setAttribute('aria-label', label);
    editor.view.dom.setAttribute('aria-multiline', 'true');
  }, [editor, label]);

  useEffect(() => {
    if (
      !isDefined(editor) ||
      editor.isDestroyed ||
      serializeAdvancedTextEditorDocument(editor) === body
    ) {
      return;
    }

    const content = deserializeAdvancedTextEditorDocument({
      serializedDocument: body,
      parseLegacyDocument: INLINE_EMAIL_BODY_EDITOR_PROFILE.parseLegacyDocument,
    });

    editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, body]);

  return null;
};
