type SearchableMarketplaceApp = {
  name: string;
  description: string;
  author: string;
  category: string;
};

export const filterMarketplaceApps = <
  TMarketplaceApp extends SearchableMarketplaceApp,
>({
  marketplaceApps,
  searchTerm,
}: {
  marketplaceApps: TMarketplaceApp[];
  searchTerm: string;
}): TMarketplaceApp[] => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (normalizedSearchTerm.length === 0) {
    return marketplaceApps;
  }

  return marketplaceApps.filter((marketplaceApp) =>
    [
      marketplaceApp.name,
      marketplaceApp.description,
      marketplaceApp.author,
      marketplaceApp.category,
    ].some((value) => value.toLowerCase().includes(normalizedSearchTerm)),
  );
};
