import { AppChip } from '@/applications/components/AppChip';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAccountAppLogoUrl';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

type SettingsBuiltInAccountAppDetailsProps = {
  builtInAccountApp: BuiltInAccountApp;
};

export const SettingsBuiltInAccountAppDetails = ({
  builtInAccountApp,
}: SettingsBuiltInAccountAppDetailsProps) => {
  const { t } = useLingui();

  const appName = t(builtInAccountApp.name);
  const logoUrl = getBuiltInAccountAppLogoUrl(builtInAccountApp);

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
            description={t(builtInAccountApp.description)}
            coverImageUrl={builtInAccountApp.coverImage}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
