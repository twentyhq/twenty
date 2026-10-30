import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AccountsSettingsBreadcrumbLink = BreadcrumbProps['links'][number];

export const useAccountsSettingsBreadcrumbLink = (
  legacyAccountsLabel: AccountsSettingsBreadcrumbLink['children'],
): AccountsSettingsBreadcrumbLink => {
  const { t } = useLingui();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );

  if (isAppPreferencesEnabled) {
    return {
      children: t`Apps preferences`,
      href: getSettingsPath(SettingsPath.AppPreferences),
    };
  }

  return {
    children: legacyAccountsLabel,
    href: getSettingsPath(SettingsPath.Accounts),
  };
};
