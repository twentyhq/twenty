import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MulitWorkspaceDropdownId';
import { NavigationDrawerHotKeyScope } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerHotKeyScope';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useRecoilValue } from 'recoil';
import { useMemo } from 'react';
import { ClickableComponent as MultiWorkspaceDefaultStateClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDefaultState/ClickableComponent';
import { DropdownComponents as MultiWorkspaceDefaultStateDropdownComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDefaultState/DropdownComponents';

export const MultiWorkspaceDropdownButton = () => {
  const multiWorkspaceDropdown = useRecoilValue(multiWorkspaceDropdownState);

  const { ClickableComponent, DropdownComponents } = useMemo(() => {
    switch (multiWorkspaceDropdown) {
      default:
        return {
          ClickableComponent: MultiWorkspaceDefaultStateClickableComponent,
          DropdownComponents: MultiWorkspaceDefaultStateDropdownComponents,
        };
    }
  }, [multiWorkspaceDropdown]);

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: NavigationDrawerHotKeyScope.MultiWorkspaceDropdownButton,
      }}
      dropdownOffset={{ y: -30, x: 0 }}
      clickableComponent={<ClickableComponent />}
      dropdownComponents={<DropdownComponents />}
    />
  );
};
