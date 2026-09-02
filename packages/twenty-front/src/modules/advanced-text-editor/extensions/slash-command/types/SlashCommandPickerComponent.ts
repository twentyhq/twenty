import { type Editor, type Range } from '@tiptap/core';
import { type ForwardRefExoticComponent, type RefAttributes } from 'react';

export type SlashCommandPickerRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export type SlashCommandPickerComponentProps = {
  editor: Editor;
  range: Range;
  onComplete: () => void;
  searchQuery: string;
  savedResponseSubject?: {
    getCurrentSubject: () => string;
    setSubject: (subject: string) => void;
  };
};

export type SlashCommandPickerComponent = ForwardRefExoticComponent<
  SlashCommandPickerComponentProps & RefAttributes<SlashCommandPickerRef>
>;
