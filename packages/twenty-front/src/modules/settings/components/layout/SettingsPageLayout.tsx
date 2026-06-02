import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { SettingsPageHeader } from '@/settings/components/layout/SettingsPageHeader';
import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsPageLayoutProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  actionButton?: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
};

const SETTINGS_CONTENT_MAX_WIDTH = 760;

// Header + rounded panel both sit in StyledMainColumn — same width, same
// centering. SidePanelForDesktop is alongside so opening it doesn't shift
// the page header or the tab bar relative to each other.
const StyledRoot = styled.div`
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${themeCssVariables.spacing[3]};
  }
`;

const StyledMainColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  width: 0;
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

// flex: 1 + min-height: 0 keep the overflow chain intact — child must
// participate in the flex height calc rather than collapse to content.
const StyledBodyContentWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  min-height: 0;
  overflow-y: auto;
  padding-top: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

export const SettingsPageLayout = ({
  links,
  title,
  actionButton,
  secondaryBar,
  children,
}: SettingsPageLayoutProps) => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  return (
    <StyledRoot>
      <StyledMainColumn>
        <SettingsPageHeader
          links={links}
          title={title}
          actions={actionButton}
        />
        <StyledPanel>
          {isDefined(secondaryBar) && (
            <SettingsSecondaryBar>{secondaryBar}</SettingsSecondaryBar>
          )}
          <StyledBodyContentWrapper>
            <InformationBannerWrapper />
            {children}
          </StyledBodyContentWrapper>
        </StyledPanel>
      </StyledMainColumn>
      {isMobile ? <CommandMenuForMobile /> : <SidePanelForDesktop />}
    </StyledRoot>
  );
};
