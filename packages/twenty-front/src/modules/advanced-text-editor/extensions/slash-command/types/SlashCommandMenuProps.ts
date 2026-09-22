import { type Editor, type Range } from '@tiptap/core';
import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';

export type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
  editor: Editor;
  range: Range;
  query: string;
};
