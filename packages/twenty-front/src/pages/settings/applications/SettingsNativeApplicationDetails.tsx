import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSettings } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { NATIVE_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/NativeApplicationIllustrations';

const NATIVE_APPLICATION_DETAIL_TAB_LIST_ID = 'native-application-detail-id';

export const SettingsNativeApplicationDetails = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { nativeAccountAppId } = useParams<{ nativeAccountAppId: string }>();
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const app = enabledNativeAccountApps.find(
    (enabledApp) => enabledApp.id === nativeAccountAppId,
  );

  if (!isAppPreferencesEnabled || !isDefined(app)) {
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

  return (
    <SettingsPageLayout
      title={appName}
      icon={<app.Icon size={theme.icon.size.md} />}
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
            icon={
              <Avatar
                size="xl"
                shape="square"
                variant="outline"
                name={appName}
                icon={<app.Icon size={theme.icon.size.xl} />}
              />
            }
            displayName={appName}
            description={t(app.description)}
            coverImageUrl={NATIVE_APPLICATION_ILLUSTRATIONS[app.id]}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
