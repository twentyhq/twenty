import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { SIDE_PANEL_TOP_BAR_HEIGHT } from '@/side-panel/constants/SidePanelTopBarHeight';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsPageHeaderProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  tag?: ReactNode;
  actionButton?: ReactNode;
};

// minmax(0, 1fr) side tracks (not 1fr) let a long breadcrumb truncate instead of
// pushing the centered title off its shared axis with the tabs and body.
const StyledHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  min-height: ${SIDE_PANEL_TOP_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  text-align: center;
`;

const StyledRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  min-width: 0;
`;

export const SettingsPageHeader = ({
  links,
  title,
  tag,
  actionButton,
}: SettingsPageHeaderProps) => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();

  return (
    <StyledHeader>
      <StyledLeft>
        {!isNavigationDrawerExpanded && (
          <NavigationDrawerCollapseButton direction="right" />
        )}
        <Breadcrumb links={links} />
      </StyledLeft>
      <StyledTitle>
        {!isMobile && isDefined(title) && title}
        {!isMobile && tag}
      </StyledTitle>
      <StyledRight>{actionButton}</StyledRight>
    </StyledHeader>
  );
};
