import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { MenuItemSwitch, type MenuItemSwitchProps } from 'twenty-ui/navigation';

export type CommandMenuItemSwitchProps = MenuItemSwitchProps & {
  id: string;
};

export const CommandMenuItemSwitch = (props: CommandMenuItemSwitchProps) => {
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    props.id,
  );

  return (
    <MenuItemSwitch
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      focused={isSelectedItemId}
      withIconContainer
    />
  );
};
