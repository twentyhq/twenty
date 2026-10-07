import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { MultiWorkspaceDropdownClickableComponent } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownOpenRecordInComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownOpenRecordInComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownMobileBoundaryPadding';
import { styled } from '@linaria/react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledTrigger = styled.div<{ shouldHideLabel: boolean }>`
  width: ${({ shouldHideLabel }) => (shouldHideLabel ? 'auto' : '100%')};
`;

type MultiWorkspaceDropdownButtonProps = {
  shouldHideLabel?: boolean;
};

export const MultiWorkspaceDropdownButton = ({
  shouldHideLabel = false,
}: MultiWorkspaceDropdownButtonProps) => {
  const isMobile = useIsMobile();
  const labeledTriggerAlignOffset = isMobile ? -5 : 5;

  return (
    <DropdownRoot dropdownId={MULTI_WORKSPACE_DROPDOWN_ID} type="menu">
      <Dropdown.Trigger
        nativeButton={false}
        render={<StyledTrigger shouldHideLabel={shouldHideLabel} />}
      >
        <MultiWorkspaceDropdownClickableComponent
          shouldHideLabel={shouldHideLabel}
        />
      </Dropdown.Trigger>
      <DropdownContent
        side="bottom"
        align={isMobile ? 'start' : 'end'}
        sideOffset={shouldHideLabel ? 4 : -31}
        alignOffset={shouldHideLabel ? 0 : labeledTriggerAlignOffset}
        collisionPadding={
          isMobile
            ? MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING
            : undefined
        }
      >
        <Dropdown.Page id="root">
          <MultiWorkspaceDropdownDefaultComponents />
        </Dropdown.Page>
        <Dropdown.Page id="themes" type="picker">
          <MultiWorkspaceDropdownThemesComponents />
        </Dropdown.Page>
        <Dropdown.Page id="open-record-in" type="picker">
          <MultiWorkspaceDropdownOpenRecordInComponents />
        </Dropdown.Page>
        <Dropdown.Page id="workspaces-list" type="picker">
          <MultiWorkspaceDropdownWorkspacesListComponents />
        </Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
