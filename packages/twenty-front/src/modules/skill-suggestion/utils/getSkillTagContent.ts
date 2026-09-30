import type { JSONContent } from '@tiptap/react';

import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';

export const getSkillTagContent = ({
  id,
  name,
  label,
  icon,
}: Pick<
  SkillSuggestionItem,
  'id' | 'name' | 'label' | 'icon'
>): JSONContent[] => [
  {
    type: 'skillTag',
    attrs: {
      skillId: id,
      name,
      label,
      icon,
    },
  },
  { type: 'text', text: ' ' },
];
