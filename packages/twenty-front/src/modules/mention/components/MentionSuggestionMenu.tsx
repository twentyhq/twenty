import { forwardRef } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { SuggestionListItem } from '@/ui/suggestion/components/SuggestionListItem';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import type { MentionSuggestionMenuProps } from '@/mention/types/MentionSuggestionMenuProps';
import { groupMentionSearchResultsBySection } from '@/mention/utils/groupMentionSearchResultsBySection';
import { isTeammateMentionSearchResult } from '@/mention/utils/isTeammateMentionSearchResult';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const getItemKey = (item: MentionSearchResult) =>
  `${item.objectNameSingular}-${item.recordId}`;

const getItemSection = (item: MentionSearchResult) => ({
  key: isTeammateMentionSearchResult(item)
    ? CoreObjectNameSingular.WorkspaceMember
    : item.objectNameSingular,
  label: item.objectLabelPlural,
});

const renderItem = ({
  item,
  isSelected,
  onSelect,
  id,
}: {
  item: MentionSearchResult;
  isSelected: boolean;
  onSelect: (item: MentionSearchResult) => void;
  id: string;
}) => (
  <SuggestionListItem
    id={id}
    startIcon={
      <AvatarOrIcon
        name={item.label}
        colorSeed={item.recordId}
        shape="circle"
        src={getAbsoluteImageUrl(item.imageUrl)}
      />
    }
    description={item.objectLabelSingular}
    selected={isSelected}
    onSelect={() => {
      onSelect(item);
    }}
  >
    {item.label}
  </SuggestionListItem>
);

export const MentionSuggestionMenu = forwardRef<
  unknown,
  MentionSuggestionMenuProps
>((props, ref) => {
  const { items, onSelect, editor, range } = props;

  return (
    <SuggestionMenu
      ref={ref}
      items={groupMentionSearchResultsBySection(items)}
      onSelect={onSelect}
      editor={editor}
      range={range}
      getItemKey={getItemKey}
      getItemSection={getItemSection}
      renderItem={({ item, isSelected, id }) =>
        renderItem({ item, isSelected, onSelect, id })
      }
    />
  );
});
