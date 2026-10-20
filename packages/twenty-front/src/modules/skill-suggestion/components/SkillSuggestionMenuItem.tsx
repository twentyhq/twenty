import { SuggestionListItem } from '@/ui/suggestion/components/SuggestionListItem';
import { useIcons } from 'twenty-ui/icon';

import { DEFAULT_SKILL_ICON } from '@/skill-suggestion/constants/DefaultSkillIcon';
import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';

type SkillSuggestionMenuItemProps = {
  id: string;
  item: SkillSuggestionItem;
  isSelected: boolean;
  onSelect: (item: SkillSuggestionItem) => void;
};

export const SkillSuggestionMenuItem = ({
  id,
  item,
  isSelected,
  onSelect,
}: SkillSuggestionMenuItemProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(item.icon ?? DEFAULT_SKILL_ICON);

  return (
    <SuggestionListItem
      id={id}
      startIcon={<Icon />}
      selected={isSelected}
      onSelect={() => {
        onSelect(item);
      }}
    >
      {item.label}
    </SuggestionListItem>
  );
};
