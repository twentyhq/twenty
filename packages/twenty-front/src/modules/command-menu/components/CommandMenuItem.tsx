import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { Avatar, IconArrowUpRight, IconComponent, MenuItemCommand } from 'twenty-ui';
import { useMemo } from 'react';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

export type CommandMenuItemProps = {
  label: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  avatarUrl?: string;
  firstHotKey?: string;
  secondHotKey?: string;
  shouldCloseCommandMenuOnClick?: boolean;
};

export const CommandMenuItem = ({
  label,
  to,
  id,
  onClick,
  Icon,
  avatarUrl,
  firstHotKey,
  secondHotKey,
  shouldCloseCommandMenuOnClick,
}: CommandMenuItemProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !Icon) {
    Icon = IconArrowUpRight;
  }

  const { isSelectedItemIdSelector } = useSelectableList();
  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(id));

  const AvatarIcon: IconComponent | undefined = useMemo(() => {
  if (avatarUrl) {
    return () => (
      <Avatar
        avatarUrl={avatarUrl}
        size="sm"
        placeholder={label.charAt(0)}
      />
    );
  }
  return undefined;
}, [avatarUrl, label]);

  return (
    <MenuItemCommand
      LeftIcon={AvatarIcon || Icon}
      text={label}
      firstHotKey={firstHotKey}
      secondHotKey={secondHotKey}
      onClick={() =>
        onItemClick({
          shouldCloseCommandMenuOnClick,
          onClick,
          to,
        })
      }
      isSelected={isSelectedItemId}
    />
  );
};
