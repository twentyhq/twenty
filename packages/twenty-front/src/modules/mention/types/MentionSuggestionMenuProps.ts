import type { Editor, Range } from '@tiptap/core';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

export type MentionSuggestionMenuProps = {
  items: MentionSearchResult[];
  onSelect: (item: MentionSearchResult) => void;
  editor: Editor;
  range: Range;
};
