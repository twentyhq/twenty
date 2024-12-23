export type Webhook = {
  id: string;
  targetUrl: string;
  description?: string;
  operation: string;
  operations: string[];
  secret?: string;
  __typename: 'Webhook';
};
