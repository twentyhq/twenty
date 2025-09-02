// Usage: STRIPE_API_KEY=sk_live_xxx PRODUCT_ID=prod_xxx node update-stripe-prices.js

import crypto from 'crypto';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-06-20',
});

if (!process.env.STRIPE_API_KEY || !process.env.PRODUCT_ID) {
  console.error('Missing STRIPE_API_KEY or PRODUCT_ID');
  process.exit(1);
}

const productId = process.env.PRODUCT_ID;
const currency = 'usd';

const prices = [
  // Monthly
  { interval: 'month', monthlyUSD: 0, credits: 5000, pricePer1kAbove: 8.0 },
  { interval: 'month', monthlyUSD: 29, credits: 10000, pricePer1kAbove: 4.35 },
  { interval: 'month', monthlyUSD: 99, credits: 50000, pricePer1kAbove: 2.97 },
  {
    interval: 'month',
    monthlyUSD: 199,
    credits: 110000,
    pricePer1kAbove: 2.71,
  },
  {
    interval: 'month',
    monthlyUSD: 399,
    credits: 240000,
    pricePer1kAbove: 2.49,
  },
  {
    interval: 'month',
    monthlyUSD: 999,
    credits: 700000,
    pricePer1kAbove: 1.43,
  },
  // Yearly
  { interval: 'year', monthlyUSD: 0, credits: 50000, pricePer1kAbove: 7.6 },
  { interval: 'year', monthlyUSD: 290, credits: 130000, pricePer1kAbove: 3.35 },
  { interval: 'year', monthlyUSD: 990, credits: 540000, pricePer1kAbove: 2.75 },
  {
    interval: 'year',
    monthlyUSD: 1990,
    credits: 1200000,
    pricePer1kAbove: 2.49,
  },
  {
    interval: 'year',
    monthlyUSD: 3990,
    credits: 2600000,
    pricePer1kAbove: 2.3,
  },
  {
    interval: 'year',
    monthlyUSD: 9990,
    credits: 7500000,
    pricePer1kAbove: 1.33,
  },
];

const toCents = (usd) => Math.round(usd * 100);
const perCreditCentsDecimal = (pricePer1kUSD) =>
  ((pricePer1kUSD * 100) / 1000).toFixed(5);

const meter = (
  await stripe.billing.meters.list({ status: 'active' })
).data.find((m) => m.event_name === 'WORKFLOW_NODE_RUN');

if (!meter) {
  throw new Error('Meter not found');
}

const formatCredits = (credits) => credits.toLocaleString('de-DE'); // example: 7.500.000

const makeNickname = (price) => `${formatCredits(price.credits)} Credits`;

const makeIdemKey = (price) =>
  'price_' +
  crypto
    .createHash('sha256')
    .update(
      [
        price.interval,
        price.monthlyUSD,
        price.credits,
        currency,
        price.pricePer1kAbove,
        productId,
        meter.id,
      ].join('_'),
    )
    .digest('hex')
    .slice(0, 32);

const main = async () => {
  const createdNicknames = [];

  for (const price of prices) {
    const flatAmountCents = toCents(price.monthlyUSD);
    const idemKey = makeIdemKey(price);
    const nickname = makeNickname(price);
    createdNicknames.push(nickname);

    const unitAmountPerCreditCentsDecimal = perCreditCentsDecimal(
      price.pricePer1kAbove,
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
            interval: priceCreated.interval,
            usage_type: 'metered',
            meter: meter.id,
          },
          tiers: [
            {
              up_to: priceCreated.credits,
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
    const res = await stripe.prices.list({
      product: productId,
      limit: 100,
      starting_after: startingAfter,
    });

    for (const price of res.data) {
      if (!createdNicknames.includes(price.nickname)) {
        if (price.active) {
          await stripe.prices.update(price.id, { active: false });
          console.log(`Archived: ${price.id} (${price.nickname})`);
        }
      }
    }

    hasMore = res.has_more;
    if (hasMore) {
      startingAfter = res.data[res.data.length - 1].id;
    }
  }

  console.log('\nDone.');
};

main();
