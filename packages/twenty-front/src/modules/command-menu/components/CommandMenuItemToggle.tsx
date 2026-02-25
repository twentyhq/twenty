import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { MenuItemToggle, type MenuItemToggleProps } from 'twenty-ui/navigation';

export type CommandMenuItemToggleProps = MenuItemToggleProps & {
  id: string;
};

export const CommandMenuItemToggle = (props: CommandMenuItemToggleProps) => {
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    props.id,
  );

  return (
    <MenuItemToggle
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      focused={isSelectedItemId}
      withIconContainer
    />
  );
};
