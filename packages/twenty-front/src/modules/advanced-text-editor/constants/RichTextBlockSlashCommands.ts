import { type SlashCommandConfig } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandConfig';
import { msg } from '@lingui/core/macro';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import {
  IconCaretRight,
  IconCode,
  IconFile,
  IconH1,
  IconH2,
  IconH3,
  IconTable,
} from 'twenty-ui/icon';

export const RICH_TEXT_BLOCK_SLASH_COMMANDS: SlashCommandConfig[] = [
  {
    id: 'toggleList',
    title: msg`Toggle List`,
    description: msg`List item that hides its content`,
    icon: IconCaretRight,
    keywords: [msg`toggle`, msg`collapsible`, msg`collapse`, msg`details`],
    getIsActive: (editor) => editor.isActive(TIPTAP_NODE_TYPES.TOGGLE),
    getIsVisible: (editor) => editor.can().setToggle?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setToggle().run(),
  },
  ...(
    [
      {
        level: 1,
        title: msg`Toggle Heading 1`,
        description: msg`Large heading that hides its content`,
        icon: IconH1,
        keyword: msg`h1`,
      },
      {
        level: 2,
        title: msg`Toggle Heading 2`,
        description: msg`Medium heading that hides its content`,
        icon: IconH2,
        keyword: msg`h2`,
      },
      {
        level: 3,
        title: msg`Toggle Heading 3`,
        description: msg`Small heading that hides its content`,
        icon: IconH3,
        keyword: msg`h3`,
      },
    ] as const
  ).map(({ level, title, description, icon, keyword }): SlashCommandConfig => ({
    id: `toggleHeading${level}`,
    title,
    description,
    icon,
    keywords: [msg`toggle`, msg`heading`, keyword, msg`collapsible`],
    getIsActive: () => false,
    getIsVisible: (editor) => editor.can().setToggle?.({ level }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setToggle({ level }).run(),
  })),
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
      isDefined(editor.extensionStorage.upload?.onFileUpload) &&
      editor.can().insertContent({ type: TIPTAP_NODE_TYPES.FILE }),
    getOnSelect: (editor, range) => () =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: TIPTAP_NODE_TYPES.FILE })
        .run(),
  },
];
