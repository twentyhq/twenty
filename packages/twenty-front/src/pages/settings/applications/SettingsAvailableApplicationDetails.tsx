import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconBox,
  IconColumns,
  IconCommand,
  IconDownload,
  IconFileText,
  IconInfoCircle,
  IconLayoutGrid,
  IconLock,
  IconSettings,
  IconWorld,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useMarketplaceApps } from '~/pages/settings/applications/hooks/useMarketplaceApps';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { SettingsAvailableApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsAvailableApplicationDetailContentTab';

const AVAILABLE_APPLICATION_DETAIL_ID = 'available-application-detail';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledLogo = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  overflow: hidden;
  width: 48px;
`;

const StyledLogoImage = styled.img`
  height: 32px;
  object-fit: contain;
  width: 32px;
`;

const StyledLogoPlaceholder = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.inverted};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAppName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledAppDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledContentContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledMainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledSidebar = styled.div`
  flex-shrink: 0;
  width: 180px;
`;

const StyledSidebarSection = styled.div`
  padding: ${({ theme }) => theme.spacing(3)} 0;

  &:first-of-type {
    padding-top: 0;
  }
`;

const StyledSidebarLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSidebarValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledContentItem = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const StyledScreenshotsContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  height: 300px;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  overflow: hidden;
`;

const StyledScreenshotImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledScreenshotThumbnails = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledThumbnail = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex: 1;
  height: 60px;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledThumbnailImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledSectionTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledAboutText = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.6;
  margin: 0 0 ${({ theme }) => theme.spacing(6)} 0;
  white-space: pre-line;
`;

const StyledProvidersList = styled.ul`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  list-style-type: disc;
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing(5)};
`;

const StyledProviderItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAvailableApplicationDetails = () => {
  const { availableApplicationId = '' } = useParams<{
    availableApplicationId: string;
  }>();

  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  const { data: marketplaceApps } = useMarketplaceApps();
  const { install } = useInstallMarketplaceApp();
  const canInstallMarketplaceApps = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );

  const application = useMemo(() => {
    return marketplaceApps?.find((app) => app.id === availableApplicationId);
  }, [availableApplicationId, marketplaceApps]);

  const handleInstall = async () => {
    if (isDefined(application)) {
      await install();
    }
  };

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    AVAILABLE_APPLICATION_DETAIL_ID,
  );

  const tabs = [
    { id: 'about', title: t`About`, Icon: IconInfoCircle },
    { id: 'content', title: t`Content`, Icon: IconBox },
    { id: 'permissions', title: t`Permissions`, Icon: IconLock },
    { id: 'settings', title: t`Settings`, Icon: IconSettings },
  ];

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const hasScreenshots =
    application?.screenshots && application.screenshots.length > 0;

  const renderActiveTabContent = () => {
    if (!application) return null;

    switch (activeTabId) {
      case 'about':
        return (
          <>
            {hasScreenshots && (
              <>
                <StyledScreenshotsContainer>
                  <StyledScreenshotImage
                    src={application.screenshots[selectedScreenshotIndex]}
                    alt={`${application.name} screenshot ${selectedScreenshotIndex + 1}`}
                  />
                </StyledScreenshotsContainer>
                <StyledScreenshotThumbnails>
                  {application.screenshots
                    .slice(0, 6)
                    .map((screenshot, index) => (
                      <StyledThumbnail
                        key={index}
                        isSelected={index === selectedScreenshotIndex}
                        onClick={() => setSelectedScreenshotIndex(index)}
                      >
                        <StyledThumbnailImage
                          src={screenshot}
                          alt={`${application.name} thumbnail ${index + 1}`}
                        />
                      </StyledThumbnail>
                    ))}
                </StyledScreenshotThumbnails>
              </>
            )}

            <StyledContentContainer>
              <StyledMainContent>
                <Section>
                  <StyledSectionTitle>{t`About`}</StyledSectionTitle>
                  <StyledAboutText>
                    {application.aboutDescription}
                  </StyledAboutText>

                  <StyledSectionTitle>{t`Providers`}</StyledSectionTitle>
                  <StyledProvidersList>
                    {application.providers.map((provider) => (
                      <StyledProviderItem key={provider}>
                        {provider}
                      </StyledProviderItem>
                    ))}
                  </StyledProvidersList>
                </Section>
              </StyledMainContent>

              <StyledSidebar>
                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Created by`}</StyledSidebarLabel>
                  <StyledSidebarValue>{application.author}</StyledSidebarValue>
                </StyledSidebarSection>

                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Category`}</StyledSidebarLabel>
                  <StyledSidebarValue>
                    {application.category}
                  </StyledSidebarValue>
                </StyledSidebarSection>

                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Content`}</StyledSidebarLabel>
                  <StyledContentItem>
                    <IconLayoutGrid size={16} />
                    {application.content.objects} {t`objects`}
                  </StyledContentItem>
                  <StyledContentItem>
                    <IconColumns size={16} />
                    {application.content.fields} {t`fields`}
                  </StyledContentItem>
                  <StyledContentItem>
                    <IconApps size={16} />
                    {application.content.frontComponents} {t`front components`}
                  </StyledContentItem>
                  <StyledContentItem>
                    <IconCommand size={16} />
                    {application.content.functions} {t`functions`}
                  </StyledContentItem>
                </StyledSidebarSection>

                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Latest`}</StyledSidebarLabel>
                  <StyledSidebarValue>{application.version}</StyledSidebarValue>
                </StyledSidebarSection>

                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Developers links`}</StyledSidebarLabel>
                  <StyledLink
                    href={application.websiteUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconWorld size={16} />
                    {t`Website`}
                  </StyledLink>
                  <StyledLink
                    href={application.termsUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconFileText size={16} />
                    {t`Terms / Privacy`}
                  </StyledLink>
                </StyledSidebarSection>
              </StyledSidebar>
            </StyledContentContainer>
          </>
        );
      case 'content':
        return (
          <SettingsAvailableApplicationDetailContentTab
            application={application}
          />
        );
      case 'permissions':
        return (
          <SettingsApplicationPermissionsTab
            marketplaceAppDefaultRole={application.defaultRole}
            marketplaceAppObjects={application.objects}
          />
        );
      case 'settings':
        return <div>{t`Settings tab`}</div>;
      default:
        return null;
    }
  };

  if (!application) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={application.name}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: application.name },
      ]}
    >
      <SettingsPageContainer>
        <StyledHeader>
          <StyledHeaderLeft>
            <StyledLogo>
              {application.logo ? (
                <StyledLogoImage
                  src={application.logo}
                  alt={application.name}
                />
              ) : (
                <StyledLogoPlaceholder>
                  {getInitials(application.name)}
                </StyledLogoPlaceholder>
              )}
            </StyledLogo>
            <StyledHeaderInfo>
              <StyledAppName>{application.name}</StyledAppName>
              <StyledAppDescription>
                {application.description}
              </StyledAppDescription>
            </StyledHeaderInfo>
          </StyledHeaderLeft>
          {canInstallMarketplaceApps && (
            <Button
              Icon={IconDownload}
              title={t`Install`}
              variant="primary"
              accent="blue"
              onClick={handleInstall}
            />
          )}
        </StyledHeader>

        <TabList
          tabs={tabs}
          componentInstanceId={AVAILABLE_APPLICATION_DETAIL_ID}
          behaveAsLinks={false}
        />

        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
