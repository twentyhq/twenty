import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconBox,
  IconCheck,
  IconColumns,
  IconCommand,
  IconDownload,
  IconEyeOff,
  IconFileText,
  IconInfoCircle,
  IconLayoutGrid,
  IconLock,
  IconSettings,
  IconWorld,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import {
  PermissionFlagType,
  FindOneApplicationByUniversalIdentifierDocument,
  FindOneMarketplaceAppDocument,
} from '~/generated-metadata/graphql';
import { useMarketplaceApps } from '~/modules/marketplace/hooks/useMarketplaceApps';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { SettingsAvailableApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsAvailableApplicationDetailContentTab';

const AVAILABLE_APPLICATION_DETAIL_ID = 'available-application-detail';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledLogo = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
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
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAppName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAppDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledContentContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[8]};
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
  padding: ${themeCssVariables.spacing[3]} 0;

  &:first-of-type {
    padding-top: 0;
  }
`;

const StyledSidebarLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSidebarValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledContentItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
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
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  height: 300px;
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

const StyledScreenshotImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledScreenshotThumbnails = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledThumbnail = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex: 1;
  height: 60px;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledThumbnailImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledSectionTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledAboutText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.6;
  margin: 0 0 ${themeCssVariables.spacing[6]} 0;
  white-space: pre-line;
`;

const StyledProvidersList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  list-style-type: disc;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[5]};
`;

const StyledProviderItem = styled.li`
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledUnlistedBanner = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

export const SettingsAvailableApplicationDetails = () => {
  const { availableApplicationId = '' } = useParams<{
    availableApplicationId: string;
  }>();

  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  const { data: marketplaceApps } = useMarketplaceApps();
  const { install, isInstalling } = useInstallMarketplaceApp();
  const canInstallMarketplaceApps = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );
  const { data: installedAppData } =
    useQuery(FindOneApplicationByUniversalIdentifierDocument, {
      variables: { universalIdentifier: availableApplicationId },
      skip: !availableApplicationId,
    });

  const listedApp = marketplaceApps?.find(
    (app) => app.id === availableApplicationId,
  );

  const { data: singleAppData } = useQuery(FindOneMarketplaceAppDocument, {
    variables: { universalIdentifier: availableApplicationId },
    skip: isDefined(listedApp) || !availableApplicationId,
  });

  const singleApp = singleAppData?.findOneMarketplaceApp;

  const application = isDefined(listedApp)
    ? listedApp
    : isDefined(singleApp)
      ? {
          ...singleApp,
          content: {
            objects: (singleApp.objects ?? []).length,
            fields:
              (singleApp.objects ?? []).reduce(
                (count, appObject) => count + appObject.fields.length,
                0,
              ) + (singleApp.fields ?? []).length,
            functions: (singleApp.logicFunctions ?? []).length,
            frontComponents: (singleApp.frontComponents ?? []).length,
          },
        }
      : undefined;

  const isUnlisted = !isDefined(listedApp) && isDefined(application);

  const isAlreadyInstalled = isDefined(installedAppData?.findOneApplication);

  const handleInstall = async () => {
    if (isDefined(application)) {
      await install({
        universalIdentifier: application.id,
      });
    }
  };

  const activeTabId = useAtomComponentStateValue(
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
        {isUnlisted && (
          <StyledUnlistedBanner>
            <IconEyeOff size={16} />
            {t`This application is not listed on the marketplace. It was shared via a direct link.`}
          </StyledUnlistedBanner>
        )}
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
              Icon={isAlreadyInstalled ? IconCheck : IconDownload}
              title={
                isAlreadyInstalled
                  ? t`Installed`
                  : isInstalling
                    ? t`Installing...`
                    : t`Install`
              }
              variant={isAlreadyInstalled ? 'secondary' : 'primary'}
              accent={isAlreadyInstalled ? 'default' : 'blue'}
              onClick={handleInstall}
              disabled={isAlreadyInstalled || isInstalling}
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
