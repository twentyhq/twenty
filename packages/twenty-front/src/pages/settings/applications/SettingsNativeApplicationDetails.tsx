import { AppChip } from '@/applications/components/AppChip';
import { getNativeAccountAppLogoUrl } from '@/settings/app-preferences/utils/getNativeAccountAppLogoUrl';
import { useInstalledNativeAccountApps } from '@/settings/applications/hooks/useInstalledNativeAccountApps';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSettings } from 'twenty-ui/icon';
import { NATIVE_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/NativeApplicationIllustrations';

const NATIVE_APPLICATION_DETAIL_TAB_LIST_ID = 'native-application-detail-id';

export const SettingsNativeApplicationDetails = () => {
  const { t } = useLingui();
  const { nativeAccountAppId } = useParams<{ nativeAccountAppId: string }>();
  const app = useInstalledNativeAccountApps().find(
    (installedApp) => installedApp.id === nativeAccountAppId,
  );

  if (!isDefined(app)) {
    return (
      <Navigate
        to={getSettingsPath(
          SettingsPath.Applications,
          undefined,
          undefined,
          'installed',
        )}
        replace
      />
    );
  }

  const appName = t(app.name);
  const logoUrl = getNativeAccountAppLogoUrl(app);

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
          componentInstanceId={NATIVE_APPLICATION_DETAIL_TAB_LIST_ID}
        />
      }
    >
      <SettingsPageContainer overflow="visible">
        <Section.Root>
          <SettingsApplicationOverviewCard
            logoUrl={logoUrl}
            displayName={appName}
            description={t(app.description)}
            coverImageUrl={NATIVE_APPLICATION_ILLUSTRATIONS[app.id]}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
