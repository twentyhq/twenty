import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleDot, IconStatusChange, IconUpload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { type Application } from '~/generated-metadata/graphql';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';

export const SettingsApplicationVersionContainer = ({
  application,
  latestAvailableVersion,
  appRegistrationId,
}: {
  application?: Omit<Application, 'objects' | 'universalIdentifier'> & {
    objects: { id: string }[];
  };
  latestAvailableVersion?: string | null;
  appRegistrationId?: string | null;
}) => {
  const loading = !isDefined(application);
  const currentVersion = application?.version;
  const latestVersion = latestAvailableVersion ?? currentVersion;

  const hasUpdate =
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const { upgrade, isUpgrading } = useUpgradeApplication();

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
  ];

  return (
    <>
      <SettingsAdminTableCard
        rounded
        items={versionItems}
        gridAutoColumns="3fr 8fr"
      />
      {hasUpdate && isDefined(appRegistrationId) && (
        <Button
          Icon={IconUpload}
          title={
            isUpgrading
              ? t`Upgrading...`
              : t`Upgrade to ${latestAvailableVersion}`
          }
          variant="secondary"
          accent="blue"
          onClick={handleUpgrade}
          disabled={isUpgrading}
        />
      )}
    </>
  );
};
