import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { MenuItemToggle, type MenuItemToggleProps } from 'twenty-ui/navigation';

export type CommandMenuItemToggleProps = MenuItemToggleProps & {
  id: string;
};

export const CommandMenuItemToggle = (props: CommandMenuItemToggleProps) => {
  const isSelectedItemId = useRecoilComponentFamilyValueV2(
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
