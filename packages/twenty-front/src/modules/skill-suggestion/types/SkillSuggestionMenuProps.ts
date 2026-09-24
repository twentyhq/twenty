import type { Editor, Range } from '@tiptap/core';

import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';

export type SkillSuggestionMenuProps = {
  items: SkillSuggestionItem[];
  onSelect: (item: SkillSuggestionItem) => void;
  editor: Editor;
  range: Range;
};
