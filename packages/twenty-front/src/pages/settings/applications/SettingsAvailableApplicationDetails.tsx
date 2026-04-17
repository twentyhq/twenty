import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
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
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconBook,
  IconBox,
  IconBrandNpm,
  IconCheck,
  IconCommand,
  IconDownload,
  IconGraph,
  IconInfoCircle,
  IconLego,
  IconLink,
  IconListDetails,
  IconLock,
  IconMail,
  IconSettings,
  IconShield,
  IconUpload,
  IconWorld,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import {
  PermissionFlagType,
  FindOneApplicationByUniversalIdentifierDocument,
  FindMarketplaceAppDetailDocument,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { SettingsAvailableApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsAvailableApplicationDetailContentTab';
import { SettingsApplicationDetailTitle } from '~/pages/settings/applications/components/SettingsApplicationDetailTitle';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { SettingsApplicationDetailSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailSettingsTab';

const AVAILABLE_APPLICATION_DETAIL_ID = 'available-application-detail';

const StyledContentContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMainContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledSidebar = styled.div`
  flex-shrink: 0;
  width: 140px;
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
  margin-bottom: ${themeCssVariables.spacing[2]};
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
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledAboutContainer = styled.div``;

export const SettingsAvailableApplicationDetails = () => {
  const { availableApplicationId = '' } = useParams<{
    availableApplicationId: string;
  }>();

  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  const { install, isInstalling } = useInstallMarketplaceApp();

  const canInstallMarketplaceApps = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );

  const { data: applicationData } = useQuery(
    FindOneApplicationByUniversalIdentifierDocument,
    {
      variables: { universalIdentifier: availableApplicationId },
      skip: !availableApplicationId,
    },
  );

  const { data: detailData } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: availableApplicationId },
    skip: !availableApplicationId,
  });

  const application = applicationData?.findOneApplication;

  const detail = detailData?.findMarketplaceAppDetail;
  const manifest = detail?.manifest as Manifest | undefined;
  const app = manifest?.application;

  const displayName = app?.displayName ?? detail?.name ?? '';
  const description = app?.description ?? '';
  const screenshots = app?.screenshots ?? [];
  const aboutDescription = app?.aboutDescription;

  const currentVersion = application?.version;
  const latestAvailableVersion = detail?.latestAvailableVersion;

  const sourceType = detail?.sourceType;
  const isNpmApp = sourceType === ApplicationRegistrationSourceType.NPM;
  const registrationId = detail?.id;
  const sourcePackageUrl =
    isNpmApp && detail?.sourcePackage
      ? `https://www.npmjs.com/package/${detail.sourcePackage}`
      : undefined;

  const isUnlisted = isDefined(detail) && !detail.isListed;
  const installedApp = applicationData?.findOneApplication;
  const isAlreadyInstalled = isDefined(installedApp);
  const hasScreenshots = screenshots.length > 0;

  const defaultRole = manifest?.roles?.find(
    (r) => r.universalIdentifier === app?.defaultRoleUniversalIdentifier,
  );

  const handleInstall = async () => {
    if (isDefined(detail)) {
      await install({
        universalIdentifier: detail.universalIdentifier,
      });
    }
  };

  const hasUpdate =
    isNpmApp &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const { upgrade, isUpgrading } = useUpgradeApplication();

  const handleUpgrade = async () => {
    if (!isDefined(registrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade({
      appRegistrationId: registrationId,
      targetVersion: latestAvailableVersion,
    });
  };

  const getActionButton = () => {
    if (!canInstallMarketplaceApps) {
      return null;
    }
    if (!isAlreadyInstalled) {
      return (
        <StyledSidebarSection>
          <Button
            Icon={IconDownload}
            title={isInstalling ? t`Installing...` : t`Install`}
            variant={'primary'}
            accent={'blue'}
            onClick={handleInstall}
            disabled={isInstalling}
          />
        </StyledSidebarSection>
      );
    }
    if (hasUpdate && isDefined(registrationId)) {
      return (
        <StyledSidebarSection>
          <Button
            Icon={IconUpload}
            title={
              isUpgrading
                ? t`Upgrading...`
                : t`Upgrade to ${latestAvailableVersion}`
            }
            variant={'secondary'}
            accent={'blue'}
            onClick={handleUpgrade}
            disabled={isUpgrading}
          />
        </StyledSidebarSection>
      );
    }
    return (
      <StyledSidebarSection>
        <Button
          Icon={IconCheck}
          title={t`Installed`}
          variant={'secondary'}
          accent={'default'}
          disabled={isAlreadyInstalled}
        />
      </StyledSidebarSection>
    );
  };

  const contentEntries = [
    {
      icon: IconBox,
      count: (manifest?.objects ?? []).length,
      one: t`object`,
      many: t`objects`,
    },
    {
      icon: IconListDetails,
      count: (manifest?.fields ?? []).length,
      one: t`field`,
      many: t`fields`,
    },
    {
      icon: IconCommand,
      count: (manifest?.logicFunctions ?? []).length,
      one: t`logic function`,
      many: t`logic functions`,
    },
    {
      icon: IconGraph,
      count: (manifest?.frontComponents ?? []).filter(
        (fc) =>
          !isDefined(fc.command) &&
          fc.universalIdentifier !==
            manifest?.application
              .settingsCustomTabFrontComponentUniversalIdentifier,
      ).length,
      one: t`widget`,
      many: t`widgets`,
    },
    {
      icon: IconCommand,
      count: (manifest?.frontComponents ?? []).filter(
        (fc) => isDefined(fc.command) && !fc.isHeadless,
      ).length,
      one: t`command`,
      many: t`commands`,
    },
    {
      icon: IconShield,
      count: (manifest?.roles ?? []).filter(
        (role) =>
          role.universalIdentifier !==
          manifest?.application.defaultRoleUniversalIdentifier,
      ).length,
      one: t`role`,
      many: t`roles`,
    },
    {
      icon: IconBook,
      count: (manifest?.skills ?? []).length,
      one: t`skill`,
      many: t`skills`,
    },
    {
      icon: IconLego,
      count: (manifest?.agents ?? []).length,
      one: t`agent`,
      many: t`agents`,
    },
  ].filter((entry) => entry.count > 0);

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

  const renderActiveTabContent = () => {
    if (!detail) return null;

    switch (activeTabId) {
      case 'about':
        return (
          <>
            {hasScreenshots && (
              <StyledAboutContainer>
                <StyledScreenshotsContainer>
                  <StyledScreenshotImage
                    src={screenshots[selectedScreenshotIndex]}
                    alt={`${displayName} screenshot ${selectedScreenshotIndex + 1}`}
                  />
                </StyledScreenshotsContainer>
                <StyledScreenshotThumbnails>
                  {screenshots.slice(0, 6).map((screenshot, index) => (
                    <StyledThumbnail
                      key={index}
                      isSelected={index === selectedScreenshotIndex}
                      onClick={() => setSelectedScreenshotIndex(index)}
                    >
                      <StyledThumbnailImage
                        src={screenshot}
                        alt={`${displayName} thumbnail ${index + 1}`}
                      />
                    </StyledThumbnail>
                  ))}
                </StyledScreenshotThumbnails>
              </StyledAboutContainer>
            )}

            <StyledContentContainer>
              <StyledMainContent>
                <Section>
                  <StyledSectionTitle>{t`About`}</StyledSectionTitle>
                  <LazyMarkdownRenderer
                    text={
                      aboutDescription
                        ? aboutDescription
                        : t`No description available for this application`
                    }
                  />
                </Section>
              </StyledMainContent>

              <StyledSidebar>
                {getActionButton()}
                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Created by`}</StyledSidebarLabel>
                  <StyledSidebarValue>
                    {app?.author ?? 'Unknown'}
                  </StyledSidebarValue>
                </StyledSidebarSection>

                {app?.category && (
                  <StyledSidebarSection>
                    <StyledSidebarLabel>{t`Category`}</StyledSidebarLabel>
                    <StyledSidebarValue>{app.category}</StyledSidebarValue>
                  </StyledSidebarSection>
                )}

                {contentEntries.length > 0 && (
                  <StyledSidebarSection>
                    <StyledSidebarLabel>{t`Content`}</StyledSidebarLabel>
                    {contentEntries.map((entry) => (
                      <StyledContentItem key={entry.one}>
                        <entry.icon size={16} />
                        {entry.count}{' '}
                        {entry.count === 1 ? entry.one : entry.many}
                      </StyledContentItem>
                    ))}
                  </StyledSidebarSection>
                )}

                {isAlreadyInstalled && (
                  <StyledSidebarSection>
                    <StyledSidebarLabel>{t`Current`}</StyledSidebarLabel>
                    <StyledSidebarValue>
                      {installedApp?.version ?? t`Unknown`}
                    </StyledSidebarValue>
                  </StyledSidebarSection>
                )}

                <StyledSidebarSection>
                  <StyledSidebarLabel>{t`Latest`}</StyledSidebarLabel>
                  <StyledSidebarValue>
                    {detail.latestAvailableVersion ?? '0.0.0'}
                  </StyledSidebarValue>
                </StyledSidebarSection>

                {(app?.websiteUrl ||
                  app?.termsUrl ||
                  app?.emailSupport ||
                  app?.issueReportUrl) && (
                  <StyledSidebarSection>
                    <StyledSidebarLabel>{t`Developers links`}</StyledSidebarLabel>
                    {app?.websiteUrl && (
                      <StyledLink
                        href={app.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconWorld size={16} />
                        {t`Website`}
                      </StyledLink>
                    )}
                    {app?.termsUrl && (
                      <StyledLink
                        href={app.termsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconLink size={16} />
                        {t`Terms / Privacy`}
                      </StyledLink>
                    )}
                    {app?.emailSupport && (
                      <StyledLink
                        href={`mailto:${app.emailSupport}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconMail size={16} />
                        {t`Email support`}
                      </StyledLink>
                    )}
                    {app?.issueReportUrl && (
                      <StyledLink
                        href={app.issueReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconAlertTriangle size={16} />
                        {t`Report and issue`}
                      </StyledLink>
                    )}
                    {sourcePackageUrl && (
                      <StyledLink
                        href={sourcePackageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconBrandNpm size={16} />
                        {t`Npm package`}
                      </StyledLink>
                    )}
                  </StyledSidebarSection>
                )}
              </StyledSidebar>
            </StyledContentContainer>
          </>
        );
      case 'content':
        return (
          <SettingsAvailableApplicationDetailContentTab
            applicationId={detail.universalIdentifier}
            content={manifest}
          />
        );
      case 'permissions':
        return (
          <SettingsApplicationPermissionsTab
            marketplaceAppDefaultRole={defaultRole}
            marketplaceAppObjects={manifest?.objects}
          />
        );
      case 'settings':
        return (
          <SettingsApplicationDetailSettingsTab application={application} />
        );
      default:
        return null;
    }
  };

  if (!detail) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: displayName },
      ]}
      title={
        <SettingsApplicationDetailTitle
          displayName={displayName}
          description={description}
          logoUrl={app?.logoUrl}
          isUnlisted={isUnlisted}
        />
      }
    >
      <SettingsPageContainer>
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
