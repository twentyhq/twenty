import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconCheck, IconDownload, IconTrash, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type ContentEntry,
  type DeveloperLinks,
  SettingsApplicationAboutSidebar,
} from '@/settings/applications/components/SettingsApplicationAboutSidebar';
import { SettingsApplicationScreenshotGallery } from '@/settings/applications/components/SettingsApplicationScreenshotGallery';

const UNINSTALL_APPLICATION_MODAL_ID = 'uninstall-application-modal';
const INSTALL_INCOMPATIBLE_TOOLTIP_ANCHOR_ID =
  'install-incompatible-tooltip-anchor';

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
  isServerVersionCompatible?: boolean;
  requiredServerVersionRange?: string;
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

const StyledIncompatibleInstallContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMainContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledMarkdownContent = styled.div`
  .markdown-section {
    margin: 0;
  }

  .markdown-section h4 {
    font-size: ${themeCssVariables.font.size.lg};
    font-weight: ${themeCssVariables.font.weight.semiBold};
    line-height: 1.35;
    margin-bottom: ${themeCssVariables.spacing[2]};
    margin-top: ${themeCssVariables.spacing[5]};
  }

  .markdown-section ul {
    margin-bottom: ${themeCssVariables.spacing[3]};
    margin-top: ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[4]};
  }

  .markdown-section li {
    margin-bottom: ${themeCssVariables.spacing[1]} !important;
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }

  .markdown-section .markdown-code-outer-container {
    margin: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]};
  }

  .markdown-section .markdown-block-code {
    padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  }

  .markdown-section .markdown-block-code code {
    color: ${themeCssVariables.font.color.primary};
    display: block;
    font-family: ${themeCssVariables.code.font.family}, monospace;
    font-size: ${themeCssVariables.font.size.sm};
    line-height: 1.6;
  }
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
  isServerVersionCompatible,
  requiredServerVersionRange,
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
      if (isServerVersionCompatible === false) {
        const incompatibleTagText = isNonEmptyString(requiredServerVersionRange)
          ? t`Requires Twenty ${requiredServerVersionRange}`
          : t`Incompatible version`;

        const incompatibleTooltipContent = isNonEmptyString(
          requiredServerVersionRange,
        )
          ? t`This application cannot be installed on this instance: it requires Twenty ${requiredServerVersionRange} and this instance's version is lower.`
          : t`This application cannot be installed on this instance: the instance version is incompatible.`;

        return (
          <StyledIncompatibleInstallContainer>
            <div id={INSTALL_INCOMPATIBLE_TOOLTIP_ANCHOR_ID}>
              <Button
                Icon={IconDownload}
                title={t`Install`}
                variant={'primary'}
                accent={'blue'}
                disabled={true}
              />
            </div>
            <Tag color="orange" text={incompatibleTagText} />
            <AppTooltip
              anchorSelect={`#${INSTALL_INCOMPATIBLE_TOOLTIP_ANCHOR_ID}`}
              content={incompatibleTooltipContent}
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          </StyledIncompatibleInstallContainer>
        );
      }

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
              : t`Upgrade to ${latestAvailableVersion ?? ''}`
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
            <StyledMarkdownContent>
              <LazyMarkdownRenderer text={markdownText} />
            </StyledMarkdownContent>
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
