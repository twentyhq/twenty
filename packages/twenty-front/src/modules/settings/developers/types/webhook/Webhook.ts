export type Webhook = {
  id: string;
  targetUrl: string;
  description?: string | null;
  operations: string[];
  secret?: string;
};
