export type CreditCounterCheck = {
  key: string;
  liveValueMicro: number | null;
  rebuiltValueMicro: number;
  driftMicro: number | null;
  isDrifted: boolean;
  isOverrun: boolean;
};
