export type MarketplaceMcpServer = {
  registryName: string;
  universalIdentifier: string;
  name: string;
  label: string;
  author: string;
  description: string;
  aboutDescription: string | null;
  websiteUrl: string;
  logoUrl: string | null;
  url: string;
  toolNames: string[];
  isReadOnly: boolean | null;
};
