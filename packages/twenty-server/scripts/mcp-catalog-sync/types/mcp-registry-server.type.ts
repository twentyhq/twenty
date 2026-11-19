export type McpRegistryServer = {
  name: string;
  title?: string;
  description?: string;
  websiteUrl?: string;
  icons?: { src: string; mimeType?: string }[];
  remotes?: {
    type: string;
    url: string;
    headers?: { name: string }[];
  }[];
};
