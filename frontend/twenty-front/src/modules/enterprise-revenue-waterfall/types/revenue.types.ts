export type WaterfallSegment = {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
};

export type ARRBreakdownData = {
  period: string;
  newBusiness: number;
  expansion: number;
  contraction: number;
  churn: number;
  netChange: number;
  endingARR: number;
};

export type NRRTrendData = {
  month: string;
  nrr: number;
  target: number;
};
