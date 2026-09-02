import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { useApplicationLifecycleState } from '@/applications/hooks/useApplicationLifecycleState';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleDot, IconUpload, IconVersions } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ApplicationState, type Application } from '~/generated-metadata/graphql';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

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
  const isUpgradableApp = isUpgradableApplicationSourceType(sourceType);

  const latestVersion = isUpgradableApp
    ? (latestAvailableVersion ?? currentVersion)
    : currentVersion;

  const hasUpdate =
    isUpgradableApp &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const { upgrade, isUpgrading } = useUpgradeApplication();

  const lifecycleState = useApplicationLifecycleState({
    applicationId: application?.id,
  });

  const isUpgradeOngoing =
    isUpgrading ||
    (isDefined(lifecycleState) &&
      lifecycleState !== ApplicationState.INSTALLED);

  const handleUpgrade = async () => {
    if (!isDefined(appRegistrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade({
      appRegistrationId,
      targetVersion: latestAvailableVersion,
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
    ...(isUpgradableApp
      ? [
          {
            Icon: IconVersions,
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
            isUpgradeOngoing
              ? t`Upgrading...`
              : t`Upgrade to ${latestAvailableVersion}`
          }
          variant="secondary"
          accent="blue"
          onClick={handleUpgrade}
          disabled={isUpgradeOngoing}
        />
      )}
    </StyledContainer>
  );
};
