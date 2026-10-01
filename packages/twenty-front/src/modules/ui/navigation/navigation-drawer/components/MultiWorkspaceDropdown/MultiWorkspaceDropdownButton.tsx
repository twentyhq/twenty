import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MultiWorkspaceDropdownClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownOpenRecordInComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownOpenRecordInComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownMobileBoundaryPadding';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
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
  const isMobile = useIsMobile();

  const DropdownComponents = useMemo(() => {
    switch (multiWorkspaceDropdown) {
      case 'themes':
        return MultiWorkspaceDropdownThemesComponents;
      case 'open-record-in':
        return MultiWorkspaceDropdownOpenRecordInComponents;
      case 'workspaces-list':
        return MultiWorkspaceDropdownWorkspacesListComponents;
      default:
        return MultiWorkspaceDropdownDefaultComponents;
    }
  }, [multiWorkspaceDropdown]);

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      // On mobile the row is the full screen, so end alignment would drift the panel away from the workspace name
      dropdownPlacement={isMobile ? 'bottom-start' : 'bottom-end'}
      middlewareBoundaryPadding={
        isMobile
          ? {
              left: MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING,
              right: MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING,
            }
          : undefined
      }
      dropdownOffset={
        // The icon-only trigger is too small for the panel to overlay, so it drops below
        shouldHideLabel ? { y: 4, x: 0 } : { y: -31, x: -5 }
      }
      clickableComponent={
        <MultiWorkspaceDropdownClickableComponent
          shouldHideLabel={shouldHideLabel}
        />
      }
      clickableComponentWidth={shouldHideLabel ? 'auto' : '100%'}
      dropdownComponents={<DropdownComponents />}
      onClose={() => {
        setMultiWorkspaceDropdown('default');
      }}
    />
  );
};
