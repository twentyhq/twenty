import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
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

// Header row inside the settings card. Symmetric padding + 1fr / auto / 1fr grid
// keep the title centered on the same vertical axis as the tabs and body content.
const StyledHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr auto 1fr;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-self: start;
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
  justify-self: end;
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
