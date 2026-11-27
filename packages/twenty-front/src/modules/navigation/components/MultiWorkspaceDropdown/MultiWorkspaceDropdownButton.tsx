import { DropdownClickOutsideListenerExclusion } from '@/ui/layout/dropdown/components/DropdownClickOutsideListenerExclusion';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { MultiWorkspaceDropdownClickableComponent } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownClickableComponent';
import { MultiWorkspaceDropdownDefaultComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownOpenRecordInComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownOpenRecordInComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/navigation/constants/MultiWorkspaceDropdownId';
import { MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING } from '@/navigation/constants/MultiWorkspaceDropdownMobileBoundaryPadding';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import { useContext } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledTrigger = styled.div<{ shouldHideLabel: boolean }>`
  width: ${({ shouldHideLabel }) => (shouldHideLabel ? 'auto' : '100%')};
`;

const StyledDropdownContent = styled(Dropdown.Content)`
  transform-origin: var(--transform-origin);

  @media (prefers-reduced-motion: no-preference) {
    transition:
      opacity calc(${themeCssVariables.animation.duration.fast} * 1s) ease-out,
      transform calc(${themeCssVariables.animation.duration.fast} * 1s) ease-out;
  }

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.96);
  }
`;

type MultiWorkspaceDropdownButtonProps = {
  shouldHideLabel?: boolean;
};

export const MultiWorkspaceDropdownButton = ({
  shouldHideLabel = false,
}: MultiWorkspaceDropdownButtonProps) => {
  const isMobile = useIsMobile();
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
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
      <StyledDropdownContent
        data-click-outside-id={parentClickOutsideId}
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
        <DropdownClickOutsideListenerExclusion>
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
        </DropdownClickOutsideListenerExclusion>
      </StyledDropdownContent>
    </DropdownRoot>
  );
};
