import { CommandMenuForMobile } from '@/command-menu/components/CommandMenuForMobile';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { SettingsPageHeader } from '@/settings/components/layout/SettingsPageHeader';
import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { type JSX, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsPageLayoutProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  actionButton?: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
  tag?: JSX.Element;
};

const StyledRoot = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 0;
  min-width: 0;
  padding: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[1] : themeCssVariables.spacing[2]};
`;

const StyledMainCardWrapper = styled.div`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  width: 0;
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledBodyContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

export const SettingsPageLayout = ({
  links,
  title,
  actionButton,
  secondaryBar,
  children,
  tag,
}: SettingsPageLayoutProps) => {
  const isMobile = useIsMobile();

  useCommandMenuHotKeys();

  return (
    <StyledRoot isMobile={isMobile}>
      <StyledMainCardWrapper>
        <StyledCard>
          <SettingsPageHeader
            links={links}
            title={title}
            tag={tag}
            actionButton={actionButton}
          />
          {isDefined(secondaryBar) && (
            <SettingsSecondaryBar>{secondaryBar}</SettingsSecondaryBar>
          )}
          <StyledBodyContent>
            <InformationBannerWrapper />
            {children}
          </StyledBodyContent>
        </StyledCard>
      </StyledMainCardWrapper>
      {isMobile ? <CommandMenuForMobile /> : <SidePanelForDesktop />}
    </StyledRoot>
  );
};
