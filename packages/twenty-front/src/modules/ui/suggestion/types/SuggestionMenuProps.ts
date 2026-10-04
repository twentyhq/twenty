import type { Editor, Range } from '@tiptap/core';
import type { ReactNode } from 'react';

export type SuggestionMenuSelectedItemPreview<TItem> = {
  render: (item: TItem) => ReactNode;
  width: number;
};

export type SuggestionMenuSection = {
  key: string;
  label: string;
};

export type SuggestionMenuProps<TItem> = {
  items: TItem[];
  onSelect: (item: TItem) => void;
  editor: Editor;
  range: Range;
  getItemKey: (item: TItem) => string;
  renderItem: (item: TItem, isSelected: boolean) => ReactNode;
  selectedItemPreview?: SuggestionMenuSelectedItemPreview<TItem>;
  getItemSection?: (item: TItem) => SuggestionMenuSection;
  onKeyDown?: (
    event: KeyboardEvent,
    selectedIndex: number,
  ) => boolean | undefined;
};
