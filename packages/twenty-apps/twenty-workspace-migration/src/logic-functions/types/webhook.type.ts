export type Webhook = {
  id: string;
  targetUrl: string;
  operations: string[];
  description: string | null;
};
