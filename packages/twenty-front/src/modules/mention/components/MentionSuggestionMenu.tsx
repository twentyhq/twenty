import { forwardRef } from 'react';
import { AvatarChip } from 'twenty-ui/components';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import type { MentionSuggestionMenuProps } from '@/mention/types/MentionSuggestionMenuProps';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';

const getItemKey = (item: MentionSearchResult) =>
  `${item.objectNameSingular}-${item.recordId}`;

const renderItem = (
  item: MentionSearchResult,
  isSelected: boolean,
  onSelect: (item: MentionSearchResult) => void,
) => (
  <MenuItemSuggestion
    LeftIcon={() => (
      <AvatarChip
        placeholder={item.label}
        placeholderColorSeed={item.recordId}
        avatarType="rounded"
        avatarUrl={item.imageUrl}
      />
    )}
    text={item.label}
    contextualText={item.objectLabelSingular}
    selected={isSelected}
    onClick={() => {
      onSelect(item);
    }}
  />
);

export const MentionSuggestionMenu = forwardRef<
  unknown,
  MentionSuggestionMenuProps
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
      renderItem={(item, isSelected) => renderItem(item, isSelected, onSelect)}
    />
  );
});
