import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type SearchResultItem } from '@/search/types/SearchResultItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SearchResultListItemProps = {
  item: SearchResultItem;
  onClick: () => void;
  anchorId?: string;
};

export const SearchResultListItem = ({
  item,
  onClick,
  anchorId,
}: SearchResultListItemProps) => {
  const commandMenuItem = (
    <CommandMenuItem
      id={item.id}
      label={item.label}
      description={item.objectLabel}
      onClick={onClick}
      LeftComponent={
        <Avatar
          type={item.avatarType}
          avatarUrl={getAbsoluteImageUrl(item.imageUrl)}
          placeholderColorSeed={item.recordId}
          placeholder={item.label}
        />
      }
    />
  );

  return (
    <SelectableListItem itemId={item.id} onEnter={onClick}>
      {isDefined(anchorId) ? (
        <div id={anchorId}>{commandMenuItem}</div>
      ) : (
        commandMenuItem
      )}
    </SelectableListItem>
  );
};
