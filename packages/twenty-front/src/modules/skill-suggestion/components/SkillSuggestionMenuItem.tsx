import { useIcons } from 'twenty-ui/icon';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { formatSkillReference } from '@/skill-suggestion/utils/formatSkillReference';

const DEFAULT_SKILL_ICON = 'IconBook';

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
      contextualText={formatSkillReference(item.name)}
      contextualTextPosition="right"
      selected={isSelected}
      onClick={() => {
        onSelect(item);
      }}
    />
  );
};
