import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { MenuItemToggle, type MenuItemToggleProps } from 'twenty-ui/navigation';

export type CommandMenuItemToggleProps = MenuItemToggleProps & {
  id: string;
};

export const CommandMenuItemToggle = (props: CommandMenuItemToggleProps) => {
  const isSelectedItemId = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
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
