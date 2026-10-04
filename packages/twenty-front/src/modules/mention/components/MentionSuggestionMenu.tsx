import { forwardRef } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/components';

import { MENTION_SUGGESTION_TEAMMATE_LIMIT } from '@/mention/constants/MentionSuggestionTeammateLimit';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import type { MentionSuggestionMenuProps } from '@/mention/types/MentionSuggestionMenuProps';
import { groupMentionSearchResultsBySection } from '@/mention/utils/groupMentionSearchResultsBySection';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const getItemKey = (item: MentionSearchResult) =>
  `${item.objectNameSingular}-${item.recordId}`;

const getItemSectionLabel = (item: MentionSearchResult) =>
  item.objectLabelPlural;

const renderItem = (
  item: MentionSearchResult,
  isSelected: boolean,
  onSelect: (item: MentionSearchResult) => void,
) => (
  <MenuItemSuggestion
    LeftIcon={() => (
      <AvatarOrIcon
        name={item.label}
        colorSeed={item.recordId}
        shape="circle"
        src={getAbsoluteImageUrl(item.imageUrl)}
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
      items={groupMentionSearchResultsBySection({
        items,
        teammateLimit: MENTION_SUGGESTION_TEAMMATE_LIMIT,
      })}
      onSelect={onSelect}
      editor={editor}
      range={range}
      getItemKey={getItemKey}
      getItemSectionLabel={getItemSectionLabel}
      renderItem={(item, isSelected) => renderItem(item, isSelected, onSelect)}
    />
  );
});
