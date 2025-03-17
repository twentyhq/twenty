import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { NavigationDrawerHotKeyScope } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerHotKeyScope';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import { MultiWorkspaceDropdownClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

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
        return MultiWorkspaceDropdownDefaultComponents;
    }
  }, [multiWorkspaceDropdown]);

  const { isDropdownOpen } = useDropdown(MULTI_WORKSPACE_DROPDOWN_ID);

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: NavigationDrawerHotKeyScope.MultiWorkspaceDropdownButton,
      }}
      dropdownOffset={{ y: 0, x: 0 }}
      clickableComponent={
        <MultiWorkspaceDropdownClickableComponent
          isDropdownOpen={isDropdownOpen}
        />
      }
      dropdownComponents={<DropdownComponents />}
      onClose={() => {
        setMultiWorkspaceDropdown('default');
      }}
    />
  );
};
