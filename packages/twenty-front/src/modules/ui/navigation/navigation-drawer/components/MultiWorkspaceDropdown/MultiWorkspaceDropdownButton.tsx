import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MultiWorkspaceDropdownClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useMemo } from 'react';
import { useRecoilState } from 'recoil';

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

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      dropdownOffset={{ y: -30, x: -5 }}
      clickableComponent={<MultiWorkspaceDropdownClickableComponent />}
      dropdownComponents={<DropdownComponents />}
      onClose={() => {
        setMultiWorkspaceDropdown('default');
      }}
    />
  );
};
