import { SuggestionRow } from '@/ui/suggestion/components/SuggestionRow';
import { forwardRef } from 'react';
import { AvatarOrIcon } from 'twenty-ui/primitives/data-display';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import type { MentionSuggestionMenuProps } from '@/mention/types/MentionSuggestionMenuProps';
import { SuggestionMenu } from '@/ui/suggestion/components/SuggestionMenu';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const getItemKey = (item: MentionSearchResult) =>
  `${item.objectNameSingular}-${item.recordId}`;

const renderItem = ({
  item,
  isSelected,
  onSelect,
}: {
  item: MentionSearchResult;
  isSelected: boolean;
  onSelect: (item: MentionSearchResult) => void;
}) => (
  <SuggestionRow
    selected={isSelected}
    onSelect={() => {
      onSelect(item);
    }}
    startIcon={
      <AvatarOrIcon
        name={item.label}
        colorSeed={item.recordId}
        shape="circle"
        src={getAbsoluteImageUrl(item.imageUrl)}
      />
    }
    description={item.objectLabelSingular}
  >
    {item.label}
  </SuggestionRow>
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
      renderItem={(item, isSelected) =>
        renderItem({ item, isSelected, onSelect })
      }
    />
  );
});
