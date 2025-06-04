import { currentUserState } from '@/auth/states/currentUserState';
import { MOCK_REMOTE_DATABASES } from '@/settings/integrations/constants/MockRemoteDatabases';
import { SETTINGS_INTEGRATION_REQUEST_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationRequest';
import { SETTINGS_INTEGRATION_WINDMILL_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationWindmill';
import { SETTINGS_INTEGRATION_ZAPIER_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationZapier';
import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { isInsurOSAdminAccount } from '@/settings/integrations/utils/AdminAccounts';
import { getSettingsIntegrationAll } from '@/settings/integrations/utils/getSettingsIntegrationAll';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const useSettingsIntegrationCategories =
  (): SettingsIntegrationCategory[] => {
    const currentUser = useRecoilValue(currentUserState);
    const { email } = currentUser ?? {};
    const showAdminIntegrations = isInsurOSAdminAccount(email ?? '');
    const isAirtableIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_AIRTABLE_INTEGRATION_ENABLED,
    );
    const isAirtableIntegrationActive = !!MOCK_REMOTE_DATABASES.find(
      ({ name }) => name === 'airtable',
    )?.isActive;

    const isPostgresqlIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_POSTGRESQL_INTEGRATION_ENABLED,
    );

    const isPostgresqlIntegrationActive = !!MOCK_REMOTE_DATABASES.find(
      ({ name }) => name === 'postgresql',
    )?.isActive;

    const isStripeIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_STRIPE_INTEGRATION_ENABLED,
    );

    const isStripeIntegrationActive = !!MOCK_REMOTE_DATABASES.find(
      ({ name }) => name === 'stripe',
    )?.isActive;

    const allIntegrations = showAdminIntegrations
      ? getSettingsIntegrationAll({
          isAirtableIntegrationEnabled,
          isAirtableIntegrationActive,
          isPostgresqlIntegrationEnabled,
          isPostgresqlIntegrationActive,
          isStripeIntegrationEnabled,
          isStripeIntegrationActive,
        })
      : getSettingsIntegrationAll({
          isAirtableIntegrationEnabled,
          isAirtableIntegrationActive,
          isPostgresqlIntegrationEnabled: false,
          isPostgresqlIntegrationActive,
          isStripeIntegrationEnabled: false,
          isStripeIntegrationActive,
        });

    return showAdminIntegrations
      ? [
          ...(allIntegrations.integrations.length > 0 ? [allIntegrations] : []),
          SETTINGS_INTEGRATION_ZAPIER_CATEGORY,
          SETTINGS_INTEGRATION_WINDMILL_CATEGORY,
          SETTINGS_INTEGRATION_REQUEST_CATEGORY,
        ]
      : [
          ...(allIntegrations.integrations.length > 0 ? [allIntegrations] : []),
          SETTINGS_INTEGRATION_ZAPIER_CATEGORY,
        ];
  };
