import { MOCK_REMOTE_DATABASES } from '@/settings/integrations/constants/MockRemoteDatabases';
import { useSettingsIntegrationStripeCategory } from '@/settings/integrations/constants/SettingsIntegrationStripe';
import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { getSettingsIntegrationAll } from '@/settings/integrations/utils/getSettingsIntegrationAll';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useSettingsIntegrationCategories =
  (): SettingsIntegrationCategory[] => {
    const isAirtableIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IsAirtableIntegrationEnabled,
    );
    const isAirtableIntegrationActive = !!MOCK_REMOTE_DATABASES.find(
      ({ name }) => name === 'airtable',
    )?.isActive;

    const isPostgresqlIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IsPostgreSQLIntegrationEnabled,
    );
    const isPostgresqlIntegrationActive = !!MOCK_REMOTE_DATABASES.find(
      ({ name }) => name === 'postgresql',
    )?.isActive;

    const isStripeIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IsStripeIntegrationEnabled,
    );
    const isStripeIntegrationActive = !!MOCK_REMOTE_DATABASES.find(
      ({ name }) => name === 'stripe',
    )?.isActive;

    const allIntegrations = getSettingsIntegrationAll({
      isAirtableIntegrationEnabled,
      isAirtableIntegrationActive,
      isPostgresqlIntegrationEnabled,
      isPostgresqlIntegrationActive,
      isStripeIntegrationEnabled,
      isStripeIntegrationActive,
    });

    const SETTINGS_INTEGRATION_STRIPE_CATEGORY =
      useSettingsIntegrationStripeCategory();

    return [
      ...(allIntegrations.integrations.length > 0 ? [allIntegrations] : []),
      //! Check progress of feature flags from twenty.
      // SETTINGS_INTEGRATION_ZAPIER_CATEGORY,
      // SETTINGS_INTEGRATION_WINDMILL_CATEGORY,
      // SETTINGS_INTEGRATION_REQUEST_CATEGORY,
      SETTINGS_INTEGRATION_STRIPE_CATEGORY,
    ];
  };
