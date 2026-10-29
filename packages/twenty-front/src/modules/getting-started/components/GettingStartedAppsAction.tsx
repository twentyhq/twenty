import { GettingStartedAppInstallButton } from '@/getting-started/components/GettingStartedAppInstallButton';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { getApplicationDescriptionSummary } from '@/settings/applications/utils/getApplicationDescriptionSummary';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const GettingStartedAppsAction = () => {
  const { data: marketplaceApps, isLoading } = useMarketplaceApps();

  const featuredApps = GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS.map(
    (universalIdentifier) =>
      marketplaceApps.find(
        (marketplaceApp) => marketplaceApp.id === universalIdentifier,
      ),
  ).filter(isDefined);

  return (
    <SettingsListCard
      items={featuredApps}
      isLoading={isLoading}
      getItemLabel={({ name }) => name}
      getItemDescription={({ description }) =>
        getApplicationDescriptionSummary(description)
      }
      getItemAvatarUrl={({ logoUrl }) =>
        getAbsoluteImageUrl(logoUrl || null) ?? null
      }
      RowRightComponent={GettingStartedAppInstallButton}
    />
  );
};
