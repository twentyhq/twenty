import { forwardRef } from 'react';

import { SkillSuggestionMenuItem } from '@/skill-suggestion/components/SkillSuggestionMenuItem';
import { SkillSuggestionPreviewCard } from '@/skill-suggestion/components/SkillSuggestionPreviewCard';
import { SKILL_SUGGESTION_PREVIEW_WIDTH } from '@/skill-suggestion/constants/SkillSuggestionPreviewWidth';
import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import type { SkillSuggestionMenuProps } from '@/skill-suggestion/types/SkillSuggestionMenuProps';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

const getItemKey = (item: SkillSuggestionItem) => item.id;

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
      selectedItemPreview={{
        render: (item) => <SkillSuggestionPreviewCard skill={item} />,
        width: SKILL_SUGGESTION_PREVIEW_WIDTH,
      }}
    />
  );
});
