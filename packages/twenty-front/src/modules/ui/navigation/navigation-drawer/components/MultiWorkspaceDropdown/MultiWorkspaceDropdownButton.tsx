import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MulitWorkspaceDropdownId';
import { NavigationDrawerHotKeyScope } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerHotKeyScope';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import { MultiWorkspaceDropdownClickableComponent as MultiWorkspaceDefaultStateClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents as MultiWorkspaceDefaultStateDropdownComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';

export const MultiWorkspaceDropdownButton = () => {
  const [multiWorkspaceDropdown, setMultiWorkspaceDropdown] = useRecoilState(
    multiWorkspaceDropdownState,
  );

  const DropdownComponents = useMemo(() => {
    switch (multiWorkspaceDropdown) {
      case 'themes':
        return MultiWorkspaceDropdownThemesComponents;
      case 'workspaces-list':
        return MultiWorkspaceDropdownWorkspacesListComponents;
      default:
        return MultiWorkspaceDefaultStateDropdownComponents;
    }
  }, [multiWorkspaceDropdown]);

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: NavigationDrawerHotKeyScope.MultiWorkspaceDropdownButton,
      }}
      dropdownOffset={{ y: -30, x: 0 }}
      clickableComponent={<MultiWorkspaceDefaultStateClickableComponent />}
      dropdownComponents={<DropdownComponents />}
      onClose={() => {
        setMultiWorkspaceDropdown('default');
      }}
    />
  );
};
