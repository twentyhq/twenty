import { type MessageDescriptor } from '@lingui/core';
import { type Editor, type Range } from '@tiptap/core';
import { type IconComponent } from 'twenty-ui/icon';

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
