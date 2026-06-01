import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { MainContainerLayoutWithSidePanel } from '@/object-record/components/MainContainerLayoutWithSidePanel';
import { SettingsPageHeader } from '@/settings/components/layout/SettingsPageHeader';
import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsPageLayoutProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  actionButton?: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
};

const SETTINGS_CONTENT_MAX_WIDTH = 760;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// flex: 1 + min-height: 0 are required for PagePanel's overflow chain — the
// child must participate in the flex height calc rather than collapse to content.
const StyledBodyContentWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  min-height: 0;
  padding-top: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

export const SettingsPageLayout = ({
  links,
  title,
  actionButton,
  secondaryBar,
  children,
}: SettingsPageLayoutProps) => (
  <StyledContainer>
    <SettingsPageHeader links={links} title={title} actions={actionButton} />
    {isDefined(secondaryBar) && (
      <SettingsSecondaryBar>{secondaryBar}</SettingsSecondaryBar>
    )}
    <MainContainerLayoutWithSidePanel>
      <StyledBodyContentWrapper>
        <InformationBannerWrapper />
        {children}
      </StyledBodyContentWrapper>
    </MainContainerLayoutWithSidePanel>
  </StyledContainer>
);
