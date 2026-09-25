import { type MessageDescriptor } from '@lingui/core';
import { type JSONContent } from '@tiptap/core';
import { type IconComponent } from 'twenty-ui/icon';

export type AdvancedTextEditorInsertionItem = {
  id: string;
  title: MessageDescriptor;
  icon: IconComponent;
  createContent: (
    translate: (message: MessageDescriptor) => string,
  ) => JSONContent;
};
