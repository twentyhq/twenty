export type MeterBillingPriceTiers = [
  {
    up_to: number;
    flat_amount: number;
    unit_amount: null;
    flat_amount_decimal: string;
    unit_amount_decimal: null;
  },
  {
    up_to: null;
    flat_amount: null;
    unit_amount: null;
    flat_amount_decimal: null;
    unit_amount_decimal: string;
  },
];
