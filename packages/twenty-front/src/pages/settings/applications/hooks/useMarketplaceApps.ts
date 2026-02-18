import {
  useFindManyMarketplaceAppsQuery,
  type MarketplaceApp,
} from '~/generated-metadata/graphql';

export type MarketplaceAppWithContentCounts = MarketplaceApp & {
  content: {
    objects: number;
    fields: number;
    functions: number;
    frontComponents: number;
  };
};

export const useMarketplaceApps = () => {
  const { data, loading, error } = useFindManyMarketplaceAppsQuery();

  const marketplaceApps: MarketplaceAppWithContentCounts[] =
    data?.findManyMarketplaceApps.map((app) => {
      const totalFieldsCount =
        (app.objects ?? []).reduce(
          (count, appObject) => count + appObject.fields.length,
          0,
        ) + (app.fields ?? []).length;

      return {
        ...app,
        content: {
          objects: (app.objects ?? []).length,
          fields: totalFieldsCount,
          functions: (app.logicFunctions ?? []).length,
          frontComponents: (app.frontComponents ?? []).length,
        },
      };
    }) ?? [];

  return {
    data: marketplaceApps,
    isLoading: loading,
    error,
  };
};
