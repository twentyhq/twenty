import { type SlashCommandConfig } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandConfig';
import { type MessageDescriptor } from '@lingui/core';
import { type Level } from '@tiptap/extension-heading';

export type RichTextToggleHeading = Pick<
  SlashCommandConfig,
  'title' | 'description' | 'icon'
> & {
  level: Level;
  keyword: MessageDescriptor;
};
