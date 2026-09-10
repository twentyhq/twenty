import { t } from '@lingui/core/macro';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor } from '@tiptap/extensions/drop-cursor';
import { Placeholder } from '@tiptap/extensions/placeholder';
import { UndoRedo } from '@tiptap/extensions/undo-redo';
import { type AnyExtension } from '@tiptap/core';

export const buildAdvancedTextEditorCoreExtensions = ({
  placeholder,
}: {
  placeholder: string | undefined;
}): AnyExtension[] => [
  Document,
  Paragraph,
  Text,
  Placeholder.configure({
    placeholder: placeholder ?? t`Enter text or Type '/' for commands`,
  }),
  HardBreak.configure({
    keepMarks: false,
  }),
  UndoRedo,
  Dropcursor,
];
