/* eslint-disable */
// Usage: STRIPE_API_KEY=sk_live_xxx PRODUCT_ID=prod_xxx node update-stripe-prices.js

import crypto from 'crypto';

import Stripe from 'stripe';

if (!process.env.STRIPE_API_KEY || !process.env.PRODUCT_ID) {
  console.error('Missing STRIPE_API_KEY or PRODUCT_ID');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-10-28.acacia',
});

const productId = process.env.PRODUCT_ID;
const currency = 'usd';

const prices: Array<{
  interval: 'month' | 'year';
  usd: number;
  credits: number;
  pricePer1MAbove: number;
}> = [
  // Monthly
  { interval: 'month', usd: 0, credits: 5_000_000, pricePer1MAbove: 8.0 },
  {
    interval: 'month',
    usd: 29,
    credits: 10_000_000,
    pricePer1MAbove: 4.35,
  },
  {
    interval: 'month',
    usd: 99,
    credits: 50_000_000,
    pricePer1MAbove: 2.97,
  },
  {
    interval: 'month',
    usd: 199,
    credits: 110_000_000,
    pricePer1MAbove: 2.71,
  },
  {
    interval: 'month',
    usd: 399,
    credits: 240_000_000,
    pricePer1MAbove: 2.49,
  },
  {
    interval: 'month',
    usd: 999,
    credits: 700_000_000,
    pricePer1MAbove: 1.43,
  },
  // Yearly
  { interval: 'year', usd: 0, credits: 50_000_000, pricePer1MAbove: 7.6 },
  {
    interval: 'year',
    usd: 290,
    credits: 130_000_000,
    pricePer1MAbove: 3.35,
  },
  {
    interval: 'year',
    usd: 990,
    credits: 540_000_000,
    pricePer1MAbove: 2.75,
  },
  {
    interval: 'year',
    usd: 1990,
    credits: 1_200_000_000,
    pricePer1MAbove: 2.49,
  },
  {
    interval: 'year',
    usd: 3990,
    credits: 2_600_000_000,
    pricePer1MAbove: 2.3,
  },
  {
    interval: 'year',
    usd: 9990,
    credits: 7_500_000_000,
    pricePer1MAbove: 1.33,
  },
] as const;

const toCents = (usd: number) => Math.round(usd * 100);
const perCreditCentsDecimal = (pricePer1kUSD: number) =>
  ((pricePer1kUSD * 100) / 1000000).toFixed(5);

const formatCredits = (credits: number) => credits.toLocaleString('de-DE'); // example: 7.500.000

const makeNickname = (price: (typeof prices)[0]) =>
  `${formatCredits(price.credits)} Credits`;

const makeIdemKey = (price: (typeof prices)[0], meter: Stripe.Billing.Meter) =>
  'price_' +
  crypto
    .createHash('sha256')
    .update(
      [
        price.interval,
        price.usd,
        price.credits,
        currency,
        price.pricePer1MAbove,
        productId,
        meter.id,
      ].join('='),
    )
    .digest('hex')
    .slice(0, 32);

const main = async () => {
  const createdNicknames = [];

  const meter = (
    await stripe.billing.meters.list({ status: 'active' })
  ).data.find((m) => m.event_name === 'WORKFLOW_NODE_RUN');

  if (!meter) {
    throw new Error('Meter not found');
  }

  for (const price of prices) {
    const flatAmountCents = toCents(price.usd);
    const idemKey = makeIdemKey(price, meter);
    const nickname = makeNickname(price);

    createdNicknames.push(nickname);

    const unitAmountPerCreditCentsDecimal = perCreditCentsDecimal(
      price.pricePer1MAbove,
    );

    try {
      const priceCreated = await stripe.prices.create(
        {
          product: productId,
          currency,
          nickname,
          billing_scheme: 'tiered',
          tiers_mode: 'graduated',
          recurring: {
            interval: price.interval,
            usage_type: 'metered',
            meter: meter.id,
          },
          tiers: [
            {
              up_to: price.credits,
              flat_amount: flatAmountCents,
            },
            {
              up_to: 'inf',
              unit_amount_decimal: unitAmountPerCreditCentsDecimal,
            },
          ],
        },
        { idempotencyKey: idemKey },
      );

      console.log(`Created/exists: ${priceCreated.id} -> ${nickname}`);
    } catch (e) {
      console.error(`Failed: ${nickname}`);
      console.error(e);
      process.exitCode = 1;
    }
  }

  console.log('\n--- Archiving old prices ---');
  let hasMore = true;
  let startingAfter = undefined;

  while (hasMore) {
    const { data, has_more }: { data: Array<Stripe.Price>; has_more: boolean } =
      await stripe.prices.list({
        product: productId,
        limit: 100,
        starting_after: startingAfter,
      });

    for (const price of data) {
      if (price.nickname && !createdNicknames.includes(price.nickname)) {
        if (price.active) {
          await stripe.prices.update(price.id, { active: false });
          console.log(`Archived: ${price.id} (${price.nickname})`);
        }
      }
    }

    if (has_more) {
      startingAfter = data[data.length - 1].id;
    }
  }

  console.log('\nDone.');
  process.exit(0);
};

main();
