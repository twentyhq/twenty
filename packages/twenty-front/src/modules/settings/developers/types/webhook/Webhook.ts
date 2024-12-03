export type Webhook = {
  id: string;
  targetUrl: string;
  description?: string;
  operation: string;
  operations: string[];
  __typename: 'Webhook';
};
