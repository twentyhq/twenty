import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { getMultiItemFieldEditorContent } from '@/workflow/workflow-variables/utils/getMultiItemFieldEditorContent';
import { TextTag } from '@/workflow/workflow-variables/utils/textTag';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import { Extension } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { type Editor, useEditor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';

type UseMultiItemFieldEditorProps = {
  placeholder: string | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
};

const getTextBeforeCursor = (editor: Editor): string => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '');

  return textBefore;
};

const convertTextToTag = (editor: Editor, text: string): boolean => {
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return false;
  }

  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  const deleteFrom = $from.pos - text.length;
  const deleteTo = $from.pos;

  editor
    .chain()
    .focus()
    .deleteRange({ from: deleteFrom, to: deleteTo })
    .insertTextTag(trimmedText)
    .run();

  return true;
};

const CommaToTagExtension = Extension.create({
  name: 'commaToTag',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('commaToTag'),
        props: {
          handleTextInput: (_view, _from, _to, text) => {
            if (text === ',') {
              const textBefore = getTextBeforeCursor(editor);

              if (textBefore.trim().length > 0) {
                setTimeout(() => {
                  convertTextToTag(editor, textBefore);
                }, 0);
                return true;
              }
            }
            return false;
          },
          handleKeyDown: (_view, event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              const textBefore = getTextBeforeCursor(editor);

              if (textBefore.trim().length > 0) {
                setTimeout(() => {
                  convertTextToTag(editor, textBefore);
                }, 0);
                return true;
              }
            }
            return false;
          },
          handlePaste: (_view, event) => {
            const pastedText = event.clipboardData?.getData('text/plain');

            if (!pastedText) {
              return false;
            }

            const parts = pastedText.split(',');

            if (parts.length <= 1) {
              return false;
            }

            parts.forEach((part) => {
              const trimmedPart = part.trim();

              if (trimmedPart.length === 0) {
                return;
              }

              if (isStandaloneVariableString(trimmedPart)) {
                editor.commands.insertVariableTag(trimmedPart);
              } else {
                editor.commands.insertTextTag(trimmedPart);
              }
            });

            return true;
          },
        },
      }),
    ];
  },
});

export const useMultiItemFieldEditor = ({
  placeholder,
  readonly,
  defaultValue,
  onUpdate,
}: UseMultiItemFieldEditorProps) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder,
      }),
      VariableTag,
      TextTag,
      CommaToTagExtension,
      UndoRedo,
    ],
    content: isDefined(defaultValue)
      ? getMultiItemFieldEditorContent(defaultValue)
      : undefined,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  return editor;
};
