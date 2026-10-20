import { AppChip } from '@/applications/components/AppChip';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { getNativeAccountAppLogoUrl } from '@/settings/app-preferences/utils/getNativeAccountAppLogoUrl';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSettings } from 'twenty-ui/icon';

const NATIVE_ACCOUNT_APP_DETAILS_TAB_LIST_ID = 'native-account-app-details';

type SettingsNativeAccountAppDetailsProps = {
  nativeAccountApp: NativeAccountApp;
};

export const SettingsNativeAccountAppDetails = ({
  nativeAccountApp,
}: SettingsNativeAccountAppDetailsProps) => {
  const { t } = useLingui();

  const appName = t(nativeAccountApp.name);
  const logoUrl = getNativeAccountAppLogoUrl(nativeAccountApp);

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
      secondaryBar={
        <SettingsTabBar
          aria-label={t`Application details`}
          tabs={[{ id: 'general', title: t`General`, Icon: IconSettings }]}
          componentInstanceId={NATIVE_ACCOUNT_APP_DETAILS_TAB_LIST_ID}
        />
      }
    >
      <SettingsPageContainer overflow="visible">
        <Section.Root>
          <SettingsApplicationOverviewCard
            logoUrl={logoUrl}
            displayName={appName}
            description={t(nativeAccountApp.description)}
            coverImageUrl={nativeAccountApp.coverImage}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
