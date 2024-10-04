export type Webhook = {
  id: string;
  targetUrl: string;
  description?: string;
  operation: string;
  __typename: 'Webhook';
};
