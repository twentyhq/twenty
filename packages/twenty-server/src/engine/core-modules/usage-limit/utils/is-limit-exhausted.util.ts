export const isLimitExhausted = ({
  consumed,
  cost,
  limitValue,
}: {
  consumed: number;
  cost: number;
  limitValue: number;
}): boolean => consumed >= limitValue || consumed + cost > limitValue;
