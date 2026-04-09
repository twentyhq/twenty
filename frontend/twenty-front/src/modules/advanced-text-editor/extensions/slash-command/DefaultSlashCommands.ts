import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type Editor, type Range } from '@tiptap/core';
import {
  type IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconPilcrow,
} from 'twenty-ui/display';

export type SlashCommandConfig = {
  id: string;
  title: MessageDescriptor;
  description: MessageDescriptor;
  icon: IconComponent;
  keywords: MessageDescriptor[];
  getIsActive: (editor: Editor) => boolean;
  getIsVisible: (editor: Editor) => boolean;
  getOnSelect: (editor: Editor, range: Range) => () => void;
};

export const DEFAULT_SLASH_COMMANDS: SlashCommandConfig[] = [
  {
    id: 'paragraph',
    title: msg`Text`,
    description: msg`Plain text paragraph`,
    icon: IconPilcrow,
    keywords: [msg`paragraph`, msg`text`, msg`p`],
    getIsActive: (editor) => editor.isActive('paragraph'),
    getIsVisible: (editor) => editor.can().setParagraph?.() ?? false,
    getOnSelect: (editor, range) => () => {
      return editor.chain().focus().deleteRange(range).setParagraph().run();
    },
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
];
