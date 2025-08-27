import {
  NavigationDrawerItem,
  type NavigationDrawerItemProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationDrawerSubItemProps = NavigationDrawerItemProps;

export const NavigationDrawerSubItem = ({
  className,
  label,
  secondaryLabel,
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
  triggerEvent,
}: NavigationDrawerSubItemProps) => {
  return (
    <NavigationDrawerItem
      className={className}
      label={label}
      secondaryLabel={secondaryLabel}
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
      triggerEvent={triggerEvent}
    />
  );
};
