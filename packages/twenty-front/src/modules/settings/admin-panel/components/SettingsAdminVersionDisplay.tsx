import { SettingsTextLink } from '@/settings/components/SettingsTextLink';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

type SettingsAdminVersionDisplayProps = {
  version: string | undefined | null;
  loading: boolean;
  noVersionMessage: string;
};

export const SettingsAdminVersionDisplay = ({
  version,
  loading,
  noVersionMessage,
}: SettingsAdminVersionDisplayProps) => {
  const { t } = useLingui();

  if (loading) {
    return <>{t`Loading...`}</>;
  }

  if (!isNonEmptyString(version)) {
    return <>{noVersionMessage}</>;
  }

  return (
    <SettingsTextLink
      href={`https://hub.docker.com/r/twentycrm/twenty/tags?name=${version}`}
      title={version}
    >
      {version}
    </SettingsTextLink>
  );
};
