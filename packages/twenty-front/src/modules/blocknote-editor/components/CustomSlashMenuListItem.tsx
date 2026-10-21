import { type SuggestionItem } from '@/blocknote-editor/types/SuggestionMenuItems';
import { CustomSlashMenuListItemScrollEffect } from '@/blocknote-editor/components/CustomSlashMenuListItemScrollEffect';
import { getBlockNoteSuggestionMenuItemId } from '@/blocknote-editor/utils/getBlockNoteSuggestionMenuItemId';
import { SuggestionListItem } from '@/ui/suggestion/components/SuggestionListItem';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CustomSlashMenuListItemProps = {
  item: SuggestionItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
};

export const CustomSlashMenuListItem = ({
  item,
  index,
  isSelected,
  onSelect,
}: CustomSlashMenuListItemProps) => {
  const Icon = item.Icon;
  const itemRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <CustomSlashMenuListItemScrollEffect
        itemRef={itemRef}
        isSelected={isSelected}
      />
      <SuggestionListItem
        ref={itemRef}
        id={getBlockNoteSuggestionMenuItemId(index)}
        selected={isSelected}
        onSelect={onSelect}
        startIcon={isDefined(Icon) ? <Icon /> : undefined}
      >
        {item.title}
      </SuggestionListItem>
    </>
  );
};
