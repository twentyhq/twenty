import { createState } from 'twenty-ui/utilities';

export type SubscriptionEntry = {
  id: string;
  query: string;
  onRefetch: () => void;
};

export const subscriptionRegistryState = createState<
  Map<string, SubscriptionEntry>
>({
  key: 'subscriptionRegistryState',
  defaultValue: new Map(),
});
