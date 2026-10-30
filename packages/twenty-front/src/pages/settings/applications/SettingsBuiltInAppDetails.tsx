import { AppChip } from '@/applications/components/AppChip';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { getBuiltInAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAppLogoUrl';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

type SettingsBuiltInAppDetailsProps = {
  builtInApp: BuiltInApp;
};

export const SettingsBuiltInAppDetails = ({
  builtInApp,
}: SettingsBuiltInAppDetailsProps) => {
  const { t } = useLingui();

  const appName = t(builtInApp.name);
  const logoUrl = getBuiltInAppLogoUrl(builtInApp);

  return (
    <SettingsPageLayout
      title={appName}
      icon={
        <AppChip
          logoUrl={logoUrl}
          fallbackApplicationData={{ name: appName }}
          size="md"
          chipOnly
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: appName },
      ]}
    >
      <SettingsPageContainer overflow="visible">
        <Section.Root>
          <SettingsApplicationOverviewCard
            logoUrl={logoUrl}
            displayName={appName}
            description={t(builtInApp.description)}
            coverImageUrl={builtInApp.coverImage}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
