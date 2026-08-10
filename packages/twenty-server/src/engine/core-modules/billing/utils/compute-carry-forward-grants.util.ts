/* @license Enterprise */

import {
  BillingCreditGrantType,
  CAPPED_BILLING_CREDIT_GRANT_TYPES,
} from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';

export type CarryForwardGrantInput = {
  id: string;
  type: BillingCreditGrantType;
  amountMicro: number;
  createdAt: Date;
};

export type CarryForwardGrantOutput = {
  type: BillingCreditGrantType;
  amountMicro: number;
  sourceGrantId: string | null;
};

type CreditBucket = {
  grantId: string | null;
  type: BillingCreditGrantType;
  amountMicro: number;
  createdAt: Date;
};

const isCappedType = (type: BillingCreditGrantType): boolean =>
  CAPPED_BILLING_CREDIT_GRANT_TYPES.includes(type);

// Capped credits are spent first so that deliberately granted credits
// (compensation, partnership, onboarding rewards) survive the period and carry
// over at their full value instead of being clipped by the rollover cap.
const compareSpendingOrder = (a: CreditBucket, b: CreditBucket): number => {
  const [isACapped, isBCapped] = [isCappedType(a.type), isCappedType(b.type)];

  if (isACapped !== isBCapped) {
    return isACapped ? -1 : 1;
  }

  return a.createdAt.getTime() - b.createdAt.getTime();
};

export const computeCarryForwardGrants = ({
  allowanceMicro,
  liveGrants,
  usageMicro,
  rolloverCapMicro,
}: {
  allowanceMicro: number;
  liveGrants: CarryForwardGrantInput[];
  usageMicro: number;
  rolloverCapMicro: number;
}): CarryForwardGrantOutput[] => {
  const allowanceBucket: CreditBucket = {
    grantId: null,
    type: BillingCreditGrantType.ROLLOVER,
    amountMicro: Math.max(0, allowanceMicro),
    createdAt: new Date(0),
  };

  const grantBuckets: CreditBucket[] = liveGrants
    .filter((grant) => grant.amountMicro > 0)
    .map((grant) => ({
      grantId: grant.id,
      type: grant.type,
      amountMicro: grant.amountMicro,
      createdAt: grant.createdAt,
    }));

  const buckets = [allowanceBucket, ...grantBuckets].sort(compareSpendingOrder);

  let remainingUsageMicro = Math.max(0, usageMicro);

  const unspentBuckets = buckets.map((bucket) => {
    const consumedMicro = Math.min(bucket.amountMicro, remainingUsageMicro);

    remainingUsageMicro -= consumedMicro;

    return { ...bucket, amountMicro: bucket.amountMicro - consumedMicro };
  });

  const cappedUnspentMicro = unspentBuckets
    .filter((bucket) => isCappedType(bucket.type))
    .reduce((total, bucket) => total + bucket.amountMicro, 0);

  const rolloverMicro = Math.floor(
    Math.min(cappedUnspentMicro, Math.max(0, rolloverCapMicro)),
  );

  const rolloverGrants: CarryForwardGrantOutput[] =
    rolloverMicro > 0
      ? [
          {
            type: BillingCreditGrantType.ROLLOVER,
            amountMicro: rolloverMicro,
            sourceGrantId: null,
          },
        ]
      : [];

  const preservedGrants: CarryForwardGrantOutput[] = unspentBuckets
    .filter((bucket) => !isCappedType(bucket.type) && bucket.amountMicro >= 1)
    .map((bucket) => ({
      type: bucket.type,
      amountMicro: Math.floor(bucket.amountMicro),
      sourceGrantId: bucket.grantId,
    }));

  return [...rolloverGrants, ...preservedGrants];
};
