import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyValue';
import { MenuItemToggle, type MenuItemToggleProps } from 'twenty-ui/navigation';

export type CommandMenuItemToggleProps = MenuItemToggleProps & {
  id: string;
};

export const CommandMenuItemToggle = (props: CommandMenuItemToggleProps) => {
  const isSelectedItemId = useAtomComponentFamilyValue(
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
