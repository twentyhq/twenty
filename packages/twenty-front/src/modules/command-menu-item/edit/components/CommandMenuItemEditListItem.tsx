import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';

type CommandMenuItemEditListItemProps = {
  itemId: string;
  icon: string | null | undefined;
  text: string;
  onEnter: () => void;
  iconButtons: ReactNode;
};

export const CommandMenuItemEditListItem = ({
  itemId,
  icon,
  text,
  onEnter,
  iconButtons,
}: CommandMenuItemEditListItemProps) => {
  const { getIcon } = useIcons();

  return (
    <SelectableListItem itemId={itemId} onEnter={onEnter}>
      <MenuItem
        withIconContainer
        LeftIcon={isDefined(icon) ? getIcon(icon) : undefined}
        text={text}
        isIconDisplayedOnHoverOnly={false}
        iconButtons={iconButtons}
      />
    </SelectableListItem>
  );
};
