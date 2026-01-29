import { t } from '@lingui/core/macro';
import isEmpty from 'lodash.isempty';
import { useFindManyMarketplaceAppsQuery } from '~/generated/graphql';
import { type AvailableApplication } from '~/pages/settings/applications/types/availableApplication';

export const useMarketplaceApps = () => {
  const { data, loading, error } = useFindManyMarketplaceAppsQuery();

  const marketplaceApps: AvailableApplication[] =
    data?.findManyMarketplaceApps.map((app) => ({
      id: app.id,
      name: app.name,
      description: isEmpty(app.description)
        ? t`This app has no description for now.`
        : app.description,
      author: app.author,
      logoPath: app.logo ?? '',
      category: app.category,
      aboutDescription: app.aboutDescription,
      providers: app.providers,
      screenshots: app.screenshots,
      content: {
        objects: 0,
        fields: 0,
        widgets: 0,
        commands: 0,
      },
      version: app.version,
      websiteUrl: app.websiteUrl ?? '',
      termsUrl: app.termsUrl ?? '',
    })) ?? [];

  return {
    data: marketplaceApps,
    isLoading: loading,
    error,
  };
};
