import { type SlashCommandConfig } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandConfig';
import { msg } from '@lingui/core/macro';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { IconCode, IconFile, IconTable } from 'twenty-ui/icon';

export const RICH_TEXT_BLOCK_SLASH_COMMANDS: SlashCommandConfig[] = [
  {
    id: 'codeBlock',
    title: msg`Code Block`,
    description: msg`Block of code`,
    icon: IconCode,
    keywords: [msg`code`, msg`snippet`, msg`pre`],
    getIsActive: (editor) => editor.isActive('codeBlock'),
    getIsVisible: (editor) => editor.can().toggleCodeBlock?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    id: 'table',
    title: msg`Table`,
    description: msg`Grid of rows and columns`,
    icon: IconTable,
    keywords: [msg`table`, msg`grid`, msg`rows`, msg`columns`],
    getIsActive: (editor) => editor.isActive('table'),
    getIsVisible: (editor) =>
      editor.can().insertTable?.({ rows: 3, cols: 3, withHeaderRow: true }) ??
      false,
    getOnSelect: (editor, range) => () =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: 'file',
    title: msg`File`,
    description: msg`Upload a file or an image`,
    icon: IconFile,
    keywords: [msg`file`, msg`upload`, msg`attachment`, msg`image`],
    getIsActive: (editor) => editor.isActive(TIPTAP_NODE_TYPES.FILE),
    getIsVisible: (editor) =>
      isDefined(
        editor.extensionManager.extensions.find(
          (extension) => extension.name === TIPTAP_NODE_TYPES.FILE,
        )?.options.onFileUpload,
      ) && editor.can().insertContent({ type: TIPTAP_NODE_TYPES.FILE }),
    getOnSelect: (editor, range) => () =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: TIPTAP_NODE_TYPES.FILE })
        .run(),
  },
];
