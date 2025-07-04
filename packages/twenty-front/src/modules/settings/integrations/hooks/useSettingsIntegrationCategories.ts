import { MOCK_REMOTE_DATABASES } from '@/settings/integrations/constants/MockRemoteDatabases';
import { SETTINGS_INTEGRATION_AI_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationMcp';
import { SETTINGS_INTEGRATION_REQUEST_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationRequest';
import { SETTINGS_INTEGRATION_ZAPIER_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationZapier';
import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { getSettingsIntegrationAll } from '@/settings/integrations/utils/getSettingsIntegrationAll';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useSettingsIntegrationCategories =
  (): SettingsIntegrationCategory[] => {
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

    const isAiIntegrationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_AI_ENABLED,
    );

    const allIntegrations = getSettingsIntegrationAll({
      isAirtableIntegrationEnabled,
      isAirtableIntegrationActive,
      isPostgresqlIntegrationEnabled,
      isPostgresqlIntegrationActive,
      isStripeIntegrationEnabled,
      isStripeIntegrationActive,
    });

    return [
      ...(allIntegrations.integrations.length > 0 ? [allIntegrations] : []),
      SETTINGS_INTEGRATION_ZAPIER_CATEGORY,
      ...(isAiIntegrationEnabled ? [SETTINGS_INTEGRATION_AI_CATEGORY] : []),
      SETTINGS_INTEGRATION_REQUEST_CATEGORY,
    ];
  };
