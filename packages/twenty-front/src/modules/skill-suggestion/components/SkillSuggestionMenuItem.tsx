import { useIcons } from 'twenty-ui/icon';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import { DEFAULT_SKILL_ICON } from '@/skill-suggestion/constants/DefaultSkillIcon';
import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';

type SkillSuggestionMenuItemProps = {
  item: SkillSuggestionItem;
  isSelected: boolean;
  onSelect: (item: SkillSuggestionItem) => void;
};

export const SkillSuggestionMenuItem = ({
  item,
  isSelected,
  onSelect,
}: SkillSuggestionMenuItemProps) => {
  const { getIcon } = useIcons();

  return (
    <MenuItemSuggestion
      LeftIcon={getIcon(item.icon ?? DEFAULT_SKILL_ICON)}
      text={item.label}
      contextualText={item.description ?? undefined}
      selected={isSelected}
      onClick={() => {
        onSelect(item);
      }}
    />
  );
};
