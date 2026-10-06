import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsApplicationUninstallButton } from '@/settings/applications/components/SettingsApplicationUninstallButton';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconArrowUp, IconShoppingBag } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/components/layout';
import {
  type Application,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsApplicationAutoUpdateSection } from '~/pages/settings/applications/tabs/SettingsApplicationAutoUpdateSection';
import { SettingsApplicationConnectionsSection } from '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection';
import { SettingsApplicationFunctionDomainSection } from '~/pages/settings/applications/tabs/SettingsApplicationFunctionDomainSection';
import { applicationHasHttpTriggeredFunctions } from '~/pages/settings/applications/utils/applicationHasHttpTriggeredFunctions';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

type SettingsApplicationDetailGeneralTabProps = {
  application: Pick<
    Application,
    | 'id'
    | 'logoUrl'
    | 'autoUpgrade'
    | 'canBeUninstalled'
    | 'applicationRegistration'
    | 'logicFunctions'
  >;
  displayName: string;
  description?: string;
  coverImageUrl?: string;
  marketplaceUniversalIdentifier?: string;
  hasUpdate: boolean;
  latestAvailableVersion?: string;
  requiresPermissionApproval: boolean;
  onUpgrade: () => void;
  isUpgrading: boolean;
  isUpgradeDisabled: boolean;
  onUninstall: () => void;
  isUninstalling: boolean;
  uninstallProgress?: number;
};

export const SettingsApplicationDetailGeneralTab = ({
  application,
  displayName,
  description,
  coverImageUrl,
  marketplaceUniversalIdentifier,
  hasUpdate,
  latestAvailableVersion,
  requiresPermissionApproval,
  onUpgrade,
  isUpgrading,
  isUpgradeDisabled,
  onUninstall,
  isUninstalling,
  uninstallProgress,
}: SettingsApplicationDetailGeneralTabProps) => {
  const navigateSettings = useNavigateSettings();

  const canManageApplications = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const isUpgradable = isUpgradableApplicationSourceType(
    application.applicationRegistration?.sourceType,
  );

  const actions = [
    ...(isNonEmptyString(marketplaceUniversalIdentifier)
      ? [
          <Button
            key="see"
            startIcon={<IconShoppingBag />}
            variant="outline"
            size="sm"
            onClick={() =>
              navigateSettings(SettingsPath.AvailableApplicationDetail, {
                availableApplicationId: marketplaceUniversalIdentifier,
              })
            }
          >{t`See`}</Button>,
        ]
      : []),
    ...(canManageApplications && hasUpdate
      ? [
          <Button
            key="upgrade"
            startIcon={<IconArrowUp />}
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            disabled={isUpgradeDisabled}
          >
            {isUpgrading
              ? t`Upgrading...`
              : requiresPermissionApproval
                ? t`Review and upgrade to ${latestAvailableVersion ?? ''}`
                : t`Upgrade to ${latestAvailableVersion ?? ''}`}
          </Button>,
        ]
      : []),
    ...(canManageApplications && application.canBeUninstalled
      ? [
          <SettingsApplicationUninstallButton
            key="uninstall"
            onUninstall={onUninstall}
            isUninstalling={isUninstalling}
            uninstallProgress={uninstallProgress}
          />,
        ]
      : []),
  ];

  return (
    <>
      <Section.Root>
        <SettingsApplicationOverviewCard
          applicationId={application.id}
          logoUrl={application.logoUrl}
          displayName={displayName}
          description={description}
          coverImageUrl={coverImageUrl}
          actions={isNonEmptyArray(actions) ? actions : undefined}
        />
      </Section.Root>
      {isUpgradable && (
        <SettingsApplicationAutoUpdateSection
          applicationId={application.id}
          autoUpgrade={application.autoUpgrade}
        />
      )}
      {applicationHasHttpTriggeredFunctions(application) && (
        <AdvancedSettingsWrapper>
          <SettingsApplicationFunctionDomainSection
            applicationId={application.id}
          />
        </AdvancedSettingsWrapper>
      )}
      <SettingsApplicationConnectionsSection applicationId={application.id} />
    </>
  );
};
