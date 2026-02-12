export type stripeStatus = 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'PAUSED';

type stripeItem = {
  quantity: number;
};

type stripeItemsData = {
  data: stripeItem[];
};

type stripeEventObject = {
  customer: string;
  items: stripeItemsData;
  status: stripeStatus;
  quantity: number | null;
};

type stripeEventData = {
  object: stripeEventObject;
};

export type stripeEvent = {
  data: stripeEventData;
  type: string;
};

export type stripeCustomer = {
  businessName?: string;
  name: string | null;
  email: string | null;
};

export type twentyObject = {
  id: string;
  nameSingular: string;
  fields: Record<string, any>[];
};