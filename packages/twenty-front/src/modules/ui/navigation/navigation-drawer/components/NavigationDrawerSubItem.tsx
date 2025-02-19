import {
  NavigationDrawerItem,
  NavigationDrawerItemProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationDrawerSubItemProps = NavigationDrawerItemProps;

export const NavigationDrawerSubItem = ({
  className,
  label,
  objectName,
  Icon,
  to,
  onClick,
  active,
  danger,
  soon,
  count,
  keyboard,
  subItemState,
  rightOptions,
  isDragging,
}: NavigationDrawerSubItemProps) => {
  return (
    <NavigationDrawerItem
      className={className}
      label={label}
      objectName={objectName}
      indentationLevel={2}
      subItemState={subItemState}
      Icon={Icon}
      to={to}
      onClick={onClick}
      active={active}
      danger={danger}
      soon={soon}
      count={count}
      keyboard={keyboard}
      rightOptions={rightOptions}
      isDragging={isDragging}
    />
  );
};
