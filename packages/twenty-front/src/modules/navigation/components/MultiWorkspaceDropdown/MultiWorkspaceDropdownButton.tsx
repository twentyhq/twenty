import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { MultiWorkspaceDropdownClickableComponent } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownOpenRecordInComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownOpenRecordInComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/navigation/constants/MultiWorkspaceDropdownId';
import { MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING } from '@/navigation/constants/MultiWorkspaceDropdownMobileBoundaryPadding';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const shouldAlignToStart = isMobile || isCustomizableSidebarEnabled;
  const labeledTriggerAlignOffset = shouldAlignToStart ? -5 : 5;
  const desktopCollisionPadding = isCustomizableSidebarEnabled ? 0 : undefined;

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
        align={shouldAlignToStart ? 'start' : 'end'}
        sideOffset={shouldHideLabel ? 4 : -31}
        alignOffset={shouldHideLabel ? 0 : labeledTriggerAlignOffset}
        collisionPadding={
          isMobile
            ? MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING
            : desktopCollisionPadding
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
