import { forwardRef } from 'react';

import { SkillSuggestionMenuItem } from '@/skill-suggestion/components/SkillSuggestionMenuItem';
import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import type { SkillSuggestionMenuProps } from '@/skill-suggestion/types/SkillSuggestionMenuProps';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

const getItemKey = (item: SkillSuggestionItem) => item.name;

export const SkillSuggestionMenu = forwardRef<
  unknown,
  SkillSuggestionMenuProps
>((props, ref) => {
  const { items, onSelect, editor, range } = props;

  return (
    <SuggestionMenu
      ref={ref}
      items={items}
      onSelect={onSelect}
      editor={editor}
      range={range}
      getItemKey={getItemKey}
      renderItem={(item, isSelected) => (
        <SkillSuggestionMenuItem
          item={item}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      )}
    />
  );
});
