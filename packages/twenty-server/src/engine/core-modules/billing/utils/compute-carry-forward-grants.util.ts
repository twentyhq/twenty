/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  BillingCreditGrantType,
  CAPPED_BILLING_CREDIT_GRANT_TYPES,
} from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';

export type CarryForwardGrantInput = {
  grantId: string;
  type: BillingCreditGrantType;
  amountMicro: number;
  createdAt: Date;
  expiresAt: Date | null;
};

export type CarryForwardGrantOutput = {
  type: BillingCreditGrantType;
  amountMicro: number;
  sourceGrantId: string | null;
  expiresAt: Date | null;
};

type CreditBucket = {
  grantId: string | null;
  type: BillingCreditGrantType;
  amountMicro: number;
  createdAt: Date;
  expiresAt: Date | null;
};

const isCappedType = (type: BillingCreditGrantType): boolean =>
  CAPPED_BILLING_CREDIT_GRANT_TYPES.includes(type);

const hasLapsedBy = ({
  expiresAt,
  boundary,
}: {
  expiresAt: Date | null;
  boundary: Date;
}): boolean =>
  isDefined(expiresAt) && expiresAt.getTime() <= boundary.getTime();

// Capped credits are spent first so deliberate grants carry over in full instead of being clipped by the rollover cap.
const compareSpendingOrder = (a: CreditBucket, b: CreditBucket): number => {
  const [isACapped, isBCapped] = [isCappedType(a.type), isCappedType(b.type)];

  if (isACapped !== isBCapped) {
    return isACapped ? -1 : 1;
  }

  const byCreatedAt = a.createdAt.getTime() - b.createdAt.getTime();

  if (byCreatedAt !== 0) {
    return byCreatedAt;
  }

  // Grant id is part of the replay key, so same-timestamp grants need a stable order or a redelivery writes duplicate rows.
  return (a.grantId ?? '').localeCompare(b.grantId ?? '');
};

export const computeCarryForwardGrants = ({
  allowanceMicro,
  liveGrants,
  usageMicro,
  rolloverCapMicro,
  boundary,
}: {
  allowanceMicro: number;
  liveGrants: CarryForwardGrantInput[];
  usageMicro: number;
  rolloverCapMicro: number;
  boundary: Date;
}): CarryForwardGrantOutput[] => {
  const allowanceBucket: CreditBucket = {
    grantId: null,
    type: BillingCreditGrantType.ROLLOVER,
    amountMicro: Math.max(0, allowanceMicro),
    createdAt: new Date(0),
    expiresAt: null,
  };

  const buckets = [
    allowanceBucket,
    ...liveGrants.filter((grant) => grant.amountMicro > 0),
  ].sort(compareSpendingOrder);

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
            expiresAt: null,
          },
        ]
      : [];

  // Only exact because every deadline is a period end, as alignGrantExpiryToPeriodEnd guarantees.
  const preservedGrants: CarryForwardGrantOutput[] = unspentBuckets
    .filter(
      (bucket) =>
        !isCappedType(bucket.type) &&
        bucket.amountMicro >= 1 &&
        !hasLapsedBy({ expiresAt: bucket.expiresAt, boundary }),
    )
    .map((bucket) => ({
      type: bucket.type,
      amountMicro: Math.floor(bucket.amountMicro),
      sourceGrantId: bucket.grantId,
      expiresAt: bucket.expiresAt,
    }));

  return [...rolloverGrants, ...preservedGrants];
};
