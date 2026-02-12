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
  iconBackgroundColor,
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
  isSelectedInEditMode,
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
      iconBackgroundColor={iconBackgroundColor}
      to={to}
      onClick={onClick}
      active={active}
      danger={danger}
      soon={soon}
      count={count}
      keyboard={keyboard}
      rightOptions={rightOptions}
      isDragging={isDragging}
      isSelectedInEditMode={isSelectedInEditMode}
      triggerEvent={triggerEvent}
    />
  );
};
