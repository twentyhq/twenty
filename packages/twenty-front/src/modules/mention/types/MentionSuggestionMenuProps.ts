import type { Editor, Range } from '@tiptap/core';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

export type MentionSuggestionMenuProps = {
  items: MentionSearchResult[];
  onSelect: (item: MentionSearchResult) => void;
  clientRect: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
};
