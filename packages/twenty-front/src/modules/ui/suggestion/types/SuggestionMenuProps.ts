import type { Editor, Range } from '@tiptap/core';
import type { ReactNode } from 'react';

export type SuggestionMenuProps<TItem> = {
  items: TItem[];
  onSelect: (item: TItem) => void;
  editor: Editor;
  range: Range;
  getItemKey: (item: TItem) => string;
  renderItem: (item: TItem, isSelected: boolean) => ReactNode;
  onKeyDown?: (
    event: KeyboardEvent,
    selectedIndex: number,
  ) => boolean | undefined;
};
