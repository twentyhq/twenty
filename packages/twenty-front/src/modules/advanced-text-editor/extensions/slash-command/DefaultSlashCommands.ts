import { ADVANCED_TEXT_EDITOR_BLOCK_SLASH_COMMANDS } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockSlashCommands';
import { RICH_TEXT_BLOCK_SLASH_COMMANDS } from '@/advanced-text-editor/constants/RichTextBlockSlashCommands';
import { type SlashCommandConfig } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandConfig';
import { msg } from '@lingui/core/macro';
import {
  IconBlockquote,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconTextSize,
} from 'twenty-ui/icon';

const TEXT_SLASH_COMMANDS: SlashCommandConfig[] = [
  {
    id: 'paragraph',
    title: msg`Text`,
    description: msg`Plain text paragraph`,
    icon: IconTextSize,
    keywords: [msg`paragraph`, msg`text`, msg`p`],
    getIsActive: (editor) => editor.isActive('paragraph'),
    getIsVisible: (editor) => editor.can().setParagraph?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: 'h1',
    title: msg`Heading 1`,
    description: msg`Large section heading`,
    icon: IconH1,
    keywords: [msg`heading`, msg`h1`, msg`title`],
    getIsActive: (editor) => editor.isActive('heading', { level: 1 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 1 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: msg`Heading 2`,
    description: msg`Medium section heading`,
    icon: IconH2,
    keywords: [msg`heading`, msg`h2`, msg`subtitle`],
    getIsActive: (editor) => editor.isActive('heading', { level: 2 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 2 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: msg`Heading 3`,
    description: msg`Small section heading`,
    icon: IconH3,
    keywords: [msg`heading`, msg`h3`, msg`subheading`],
    getIsActive: (editor) => editor.isActive('heading', { level: 3 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 3 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    id: 'h4',
    title: msg`Heading 4`,
    description: msg`Subsection heading`,
    icon: IconH4,
    keywords: [msg`heading`, msg`h4`, msg`subheading`],
    getIsActive: (editor) => editor.isActive('heading', { level: 4 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 4 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run(),
  },
  {
    id: 'h5',
    title: msg`Heading 5`,
    description: msg`Minor subsection heading`,
    icon: IconH5,
    keywords: [msg`heading`, msg`h5`, msg`subheading`],
    getIsActive: (editor) => editor.isActive('heading', { level: 5 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 5 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 5 }).run(),
  },
  {
    id: 'h6',
    title: msg`Heading 6`,
    description: msg`Smallest heading`,
    icon: IconH6,
    keywords: [msg`heading`, msg`h6`, msg`subheading`],
    getIsActive: (editor) => editor.isActive('heading', { level: 6 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 6 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 6 }).run(),
  },
  {
    id: 'blockquote',
    title: msg`Quote`,
    description: msg`Highlighted quotation`,
    icon: IconBlockquote,
    keywords: [msg`quote`, msg`blockquote`, msg`citation`],
    getIsActive: (editor) => editor.isActive('blockquote'),
    getIsVisible: (editor) => editor.can().toggleBlockquote?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
];

const LIST_SLASH_COMMANDS: SlashCommandConfig[] = [
  {
    id: 'bulletList',
    title: msg`Bullet List`,
    description: msg`Unordered list with bullets`,
    icon: IconList,
    keywords: [msg`bullet`, msg`list`, msg`ul`, msg`unordered`],
    getIsActive: (editor) => editor.isActive('bulletList'),
    getIsVisible: (editor) => editor.can().toggleBulletList?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    title: msg`Ordered List`,
    description: msg`Numbered list`,
    icon: IconListNumbers,
    keywords: [msg`ordered`, msg`list`, msg`ol`, msg`numbered`, msg`number`],
    getIsActive: (editor) => editor.isActive('orderedList'),
    getIsVisible: (editor) => editor.can().toggleOrderedList?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: 'taskList',
    title: msg`Check List`,
    description: msg`List with checkboxes`,
    icon: IconListCheck,
    keywords: [msg`check`, msg`todo`, msg`task`, msg`checkbox`],
    getIsActive: (editor) => editor.isActive('taskList'),
    getIsVisible: (editor) => editor.can().toggleTaskList?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
];

export const DEFAULT_SLASH_COMMANDS: SlashCommandConfig[] = [
  ...TEXT_SLASH_COMMANDS,
  ...ADVANCED_TEXT_EDITOR_BLOCK_SLASH_COMMANDS,
  ...LIST_SLASH_COMMANDS,
  ...RICH_TEXT_BLOCK_SLASH_COMMANDS,
];
