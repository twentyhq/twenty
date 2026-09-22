import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { SuggestionRow } from '@/ui/suggestion/components/SuggestionRow';
import { useIcons } from 'twenty-ui/icon';

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
    <SuggestionRow
      selected={isSelected}
      onSelect={() => {
        onSelect(item);
      }}
      startIcon={
        <ListItemIcon icon={getIcon(item.icon ?? DEFAULT_SKILL_ICON)} />
      }
    >
      {item.label}
    </SuggestionRow>
  );
};
