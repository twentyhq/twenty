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
  iconColor,
  to,
  onClick,
  active,
  modifier,
  subItemState,
  rightOptions,
  isDragging,
  isSelectedInEditMode,
  triggerEvent,
  variant,
}: NavigationDrawerSubItemProps) => {
  return (
    <NavigationDrawerItem
      className={className}
      label={label}
      secondaryLabel={secondaryLabel}
      indentationLevel={2}
      subItemState={subItemState}
      Icon={Icon}
      iconColor={iconColor}
      to={to}
      onClick={onClick}
      active={active}
      modifier={modifier}
      rightOptions={rightOptions}
      isDragging={isDragging}
      isSelectedInEditMode={isSelectedInEditMode}
      triggerEvent={triggerEvent}
      variant={variant}
    />
  );
};
