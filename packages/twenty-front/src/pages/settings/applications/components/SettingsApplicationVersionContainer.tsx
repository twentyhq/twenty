import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { SettingsApplicationUpgradePlanModal } from '@/marketplace/components/SettingsApplicationUpgradePlanModal';
import {
  type ApplicationUpgradePlan,
  useUpgradeApplication,
} from '@/marketplace/hooks/useUpgradeApplication';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleDot, IconStatusChange, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import {
  ApplicationRegistrationSourceType,
  type Application,
} from '~/generated-metadata/graphql';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';

const UPGRADE_PLAN_MODAL_ID = 'settings-application-upgrade-plan-modal';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationVersionContainer = ({
  application,
  latestAvailableVersion,
  appRegistrationId,
}: {
  application?: Omit<
    Application,
    'objects' | 'universalIdentifier' | 'frontComponents'
  > & {
    objects: { id: string }[];
  };
  latestAvailableVersion?: string | null;
  appRegistrationId?: string | null;
}) => {
  const loading = !isDefined(application);
  const currentVersion = application?.version;

  const sourceType = application?.applicationRegistration?.sourceType;
  const isNpmApp = sourceType === ApplicationRegistrationSourceType.NPM;

  const latestVersion = isNpmApp
    ? (latestAvailableVersion ?? currentVersion)
    : currentVersion;

  const hasUpdate =
    isNpmApp &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const { planUpgrade, upgrade, isPlanning, isUpgrading } =
    useUpgradeApplication();
  const { openModal } = useModal();
  const [upgradePlan, setUpgradePlan] = useState<ApplicationUpgradePlan | null>(
    null,
  );

  const handleUpgrade = async () => {
    if (!isDefined(appRegistrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    const plan = await planUpgrade({
      appRegistrationId,
      targetVersion: latestAvailableVersion,
    });

    if (!isDefined(plan)) {
      return;
    }

    setUpgradePlan(plan);
    openModal(UPGRADE_PLAN_MODAL_ID);
  };

  const handleAuthorizeUpgrade = async (allowDestructive: boolean) => {
    if (!isDefined(appRegistrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade({
      appRegistrationId,
      targetVersion: latestAvailableVersion,
      allowDestructive,
    });
  };

  const versionItems = [
    {
      Icon: IconCircleDot,
      label: t`Current version`,
      value: (
        <SettingsAdminVersionDisplay
          version={currentVersion}
          loading={loading}
          noVersionMessage={t`Unknown`}
        />
      ),
    },
    ...(isNpmApp
      ? [
          {
            Icon: IconStatusChange,
            label: t`Latest version`,
            value: (
              <SettingsAdminVersionDisplay
                version={latestVersion}
                loading={loading}
                noVersionMessage={t`No latest version found`}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <StyledContainer>
      <SettingsTableCard
        rounded
        items={versionItems}
        gridAutoColumns="3fr 8fr"
      />
      {hasUpdate && isDefined(appRegistrationId) && (
        <Button
          Icon={IconUpload}
          title={
            isPlanning
              ? t`Checking changes...`
              : isUpgrading
                ? t`Upgrading...`
                : t`Upgrade to ${latestAvailableVersion}`
          }
          variant="secondary"
          accent="blue"
          onClick={handleUpgrade}
          disabled={isPlanning || isUpgrading}
        />
      )}
      {isDefined(upgradePlan) && (
        <SettingsApplicationUpgradePlanModal
          modalInstanceId={UPGRADE_PLAN_MODAL_ID}
          appDisplayName={application?.name ?? ''}
          appLogoUrl={application?.logo ?? undefined}
          plan={upgradePlan}
          onAuthorize={handleAuthorizeUpgrade}
          isUpgrading={isUpgrading}
        />
      )}
    </StyledContainer>
  );
};
