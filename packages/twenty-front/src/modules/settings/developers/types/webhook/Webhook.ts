export type Webhook = {
  id: string;
  targetUrl: string;
  description?: string;
  operations: string[];
  __typename: 'Webhook';
};
