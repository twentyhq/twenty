import type { Editor, Range } from '@tiptap/core';
import type { ReactNode } from 'react';

import { type SuggestionMenuItemRenderProps } from '@/ui/suggestion/types/SuggestionMenuItemRenderProps';
import { type SuggestionMenuSection } from '@/ui/suggestion/types/SuggestionMenuSection';
import { type SuggestionMenuSelectedItemPreview } from '@/ui/suggestion/types/SuggestionMenuSelectedItemPreview';

export type SuggestionMenuProps<TItem> = {
  items: TItem[];
  onSelect: (item: TItem) => void;
  editor: Editor;
  range: Range;
  getItemKey: (item: TItem) => string;
  renderItem: (props: SuggestionMenuItemRenderProps<TItem>) => ReactNode;
  selectedItemPreview?: SuggestionMenuSelectedItemPreview<TItem>;
  getItemSection?: (item: TItem) => SuggestionMenuSection;
  onKeyDown?: (
    event: KeyboardEvent,
    selectedIndex: number,
  ) => boolean | undefined;
};
