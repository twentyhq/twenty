import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCheck,
  IconDownload,
  IconTrash,
  IconUpload,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type ContentEntry,
  type DeveloperLinks,
  SettingsApplicationAboutSidebar,
} from '@/settings/applications/components/SettingsApplicationAboutSidebar';
import { SettingsApplicationScreenshotGallery } from '@/settings/applications/components/SettingsApplicationScreenshotGallery';

const UNINSTALL_APPLICATION_MODAL_ID = 'uninstall-application-modal';

type SettingsApplicationDetailAboutTabProps = {
  displayName: string;
  description?: string;
  aboutDescription?: string;
  screenshots?: string[];
  author?: string;
  category?: string;
  contentEntries?: ContentEntry[];
  currentVersion?: string;
  latestAvailableVersion?: string;
  developerLinks?: DeveloperLinks;
  isInstalled: boolean;
  canInstallMarketplaceApps?: boolean;
  onInstall?: () => void;
  isInstalling?: boolean;
  hasUpdate?: boolean;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
  canBeUninstalled?: boolean;
  onUninstall?: () => void;
  isUninstalling?: boolean;
};

const StyledContentContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMainContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const SettingsApplicationDetailAboutTab = ({
  displayName,
  description,
  aboutDescription,
  screenshots,
  author,
  category,
  contentEntries,
  currentVersion,
  latestAvailableVersion,
  developerLinks,
  isInstalled,
  canInstallMarketplaceApps,
  onInstall,
  isInstalling,
  hasUpdate,
  onUpgrade,
  isUpgrading,
  canBeUninstalled,
  onUninstall,
  isUninstalling,
}: SettingsApplicationDetailAboutTabProps) => {
  const { openModal } = useModal();

  const hasScreenshots = isDefined(screenshots) && screenshots.length > 0;

  const markdownText =
    aboutDescription ??
    description ??
    t`No description available for this application`;

  const getActionButton = () => {
    if (!canInstallMarketplaceApps) {
      return null;
    }

    if (!isInstalled) {
      return (
        <Button
          Icon={IconDownload}
          title={isInstalling ? t`Installing...` : t`Install`}
          variant={'primary'}
          accent={'blue'}
          onClick={onInstall}
          disabled={isInstalling}
        />
      );
    }

    if (hasUpdate) {
      return (
        <Button
          Icon={IconUpload}
          title={
            isUpgrading
              ? t`Upgrading...`
              : t`Upgrade to ${latestAvailableVersion}`
          }
          variant={'secondary'}
          accent={'blue'}
          onClick={onUpgrade}
          disabled={isUpgrading}
        />
      );
    }

    if (canBeUninstalled) {
      return (
        <Button
          Icon={IconTrash}
          title={isUninstalling ? t`Uninstalling...` : t`Uninstall`}
          variant={'secondary'}
          accent={'danger'}
          onClick={() => openModal(UNINSTALL_APPLICATION_MODAL_ID)}
          disabled={isUninstalling}
        />
      );
    }

    return (
      <Button
        Icon={IconCheck}
        title={t`Installed`}
        variant={'secondary'}
        accent={'default'}
        disabled={true}
      />
    );
  };

  const confirmationValue = t`yes`;

  return (
    <>
      {hasScreenshots && (
        <SettingsApplicationScreenshotGallery
          screenshots={screenshots}
          displayName={displayName}
        />
      )}

      <StyledContentContainer>
        <StyledMainContent>
          <Section>
            <LazyMarkdownRenderer text={markdownText} />
          </Section>
        </StyledMainContent>

        <SettingsApplicationAboutSidebar
          actionButton={getActionButton()}
          author={author}
          category={category}
          contentEntries={contentEntries}
          currentVersion={currentVersion}
          latestAvailableVersion={latestAvailableVersion}
          developerLinks={developerLinks}
        />
      </StyledContentContainer>

      {canBeUninstalled && isDefined(onUninstall) && (
        <ConfirmationModal
          confirmationPlaceholder={confirmationValue}
          confirmationValue={confirmationValue}
          modalInstanceId={UNINSTALL_APPLICATION_MODAL_ID}
          title={t`Uninstall Application?`}
          subtitle={
            <Trans>
              Please type {`"${confirmationValue}"`} to confirm you want to
              uninstall this application.
            </Trans>
          }
          onConfirmClick={onUninstall}
          confirmButtonText={t`Uninstall`}
          loading={isUninstalling}
        />
      )}
    </>
  );
};
