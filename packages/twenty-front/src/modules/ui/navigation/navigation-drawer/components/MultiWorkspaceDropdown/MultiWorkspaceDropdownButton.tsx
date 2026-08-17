import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MultiWorkspaceDropdownClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

type MultiWorkspaceDropdownButtonProps = {
  shouldHideLabel?: boolean;
};

export const MultiWorkspaceDropdownButton = ({
  shouldHideLabel = false,
}: MultiWorkspaceDropdownButtonProps) => {
  const [multiWorkspaceDropdown, setMultiWorkspaceDropdown] = useAtomState(
    multiWorkspaceDropdownState,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
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
      dropdownOffset={
        // The drawer trigger is full width and the panel sits over it; the
        // icon-only trigger is too small for that, so the panel drops below.
        shouldHideLabel ? { y: 4, x: 0 } : { y: -31, x: -5 }
      }
      clickableComponent={
        <MultiWorkspaceDropdownClickableComponent
          disabled={isLayoutCustomizationModeEnabled}
          shouldHideLabel={shouldHideLabel}
        />
      }
      clickableComponentWidth={shouldHideLabel ? 'auto' : '100%'}
      disableClickForClickableComponent={isLayoutCustomizationModeEnabled}
      dropdownComponents={<DropdownComponents />}
      onClose={() => {
        setMultiWorkspaceDropdown('default');
      }}
    />
  );
};
