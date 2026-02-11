import { useFindManyMarketplaceAppsQuery } from '~/generated-metadata/graphql';
import { type AvailableApplication } from '~/pages/settings/applications/types/availableApplication';

export const useMarketplaceApps = () => {
  const { data, loading, error } = useFindManyMarketplaceAppsQuery();

  const marketplaceApps: AvailableApplication[] =
    data?.findManyMarketplaceApps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description,
      author: app.author,
      logoPath: app.logo ?? '',
      category: app.category,
      aboutDescription: app.aboutDescription,
      providers: app.providers,
      screenshots: app.screenshots,
      content: {
        objects: 0,
        fields: 0,
        functions: 0,
        frontComponents: 0,
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
