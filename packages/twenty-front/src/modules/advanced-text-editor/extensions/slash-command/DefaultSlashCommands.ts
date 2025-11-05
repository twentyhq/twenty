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
  title: string;
  description: string;
  icon: IconComponent;
  keywords: string[];
  getIsActive: (editor: Editor) => boolean;
  getIsVisible: (editor: Editor) => boolean;
  getOnSelect: (editor: Editor, range: Range) => () => void;
};

export const DEFAULT_SLASH_COMMANDS: SlashCommandConfig[] = [
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Plain text paragraph',
    icon: IconPilcrow,
    keywords: ['paragraph', 'text', 'p'],
    getIsActive: (editor) => editor.isActive('paragraph'),
    getIsVisible: (editor) => editor.can().setParagraph?.() ?? true,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: IconH1,
    keywords: ['heading', 'h1', 'title'],
    getIsActive: (editor) => editor.isActive('heading', { level: 1 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 1 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: IconH2,
    keywords: ['heading', 'h2', 'subtitle'],
    getIsActive: (editor) => editor.isActive('heading', { level: 2 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 2 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: IconH3,
    keywords: ['heading', 'h3', 'subheading'],
    getIsActive: (editor) => editor.isActive('heading', { level: 3 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 3 }) ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    id: 'bulletList',
    title: 'Bullet List',
    description: 'Unordered list with bullets',
    icon: IconList,
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    getIsActive: (editor) => editor.isActive('bulletList'),
    getIsVisible: (editor) => editor.can().toggleBulletList?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    title: 'Ordered List',
    description: 'Numbered list',
    icon: IconListNumbers,
    keywords: ['ordered', 'list', 'ol', 'numbered', 'number'],
    getIsActive: (editor) => editor.isActive('orderedList'),
    getIsVisible: (editor) => editor.can().toggleOrderedList?.() ?? false,
    getOnSelect: (editor, range) => () =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
];
