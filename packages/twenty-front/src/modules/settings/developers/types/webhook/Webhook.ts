export type Webhook = {
  id: string;
  targetUrl: string;
  description?: string;
  operations: string[];
  secret?: string;
  __typename: 'Webhook';
};
