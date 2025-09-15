import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2024-10-28.acacia',
});

const PRODUCT_ID = process.env.PRODUCT_ID!;
const DRY_RUN = !!process.env.DRY_RUN;
const SLEEP_MS = parseInt(process.env.SLEEP_MS ?? '50', 10);

const tiers = [
  // Monthly
  [10_000, 5_000_000],
  [50_000, 10_000_000],
  [100_000, 50_000_000],
  [120_000, 110_000_000],

  // Yearly
  [120_000, 50_000_000],
  [600_000, 130_000_000],
  [1_200_000, 540_000_000],
] as Array<[number, number]>;

if (!process.env.STRIPE_API_KEY || !process.env.PRODUCT_ID) {
  console.error('STRIPE_API_KEY manquant ou PRODUCT_ID manquant');
  process.exit(1);
}

type PriceMap = Map<string, { sourcePriceId: string; targetPriceId: string }>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loadPriceMapping([TIER_SRC, TIER_DST]: [
  number,
  number,
]): Promise<PriceMap> {
  const { data: prices } = await stripe.prices.list({
    type: 'recurring',
    product: PRODUCT_ID,
    limit: 100,
    expand: ['data.tiers', 'data.recurring'],
  });

  const byProduct = new Map<string, Stripe.Price[]>();

  for (const p of prices) {
    if (p.recurring?.usage_type !== 'metered') continue;
    if (!Array.isArray(p.tiers)) continue;
    const arr = byProduct.get(p.product as string) ?? [];

    arr.push(p);
    byProduct.set(p.product as string, arr);
  }

  const mapByProduct: PriceMap = new Map();

  for (const [productId, plist] of byProduct.entries()) {
    const src = plist.find((pr) => pr.tiers?.some((t) => t.up_to === TIER_SRC));
    const dst = plist.find((pr) => pr.tiers?.some((t) => t.up_to === TIER_DST));

    if (src && dst) {
      mapByProduct.set(productId, {
        sourcePriceId: src.id,
        targetPriceId: dst.id,
      });
    }
  }

  return mapByProduct;
}

async function getCurrentPeriodTotalUsageMeters(params: {
  meterId: string;
  customerId: string;
  start: number;
  end: number;
}): Promise<number> {
  const { meterId, customerId, start, end } = params;
  const res = await stripe.billing.meters.listEventSummaries(meterId, {
    customer: customerId,
    start_time: start,
    end_time: end,
  });

  // Additionne aggregated_value si le meter regroupe par fenêtres
  return (res.data as Array<{ aggregated_value?: number }>).reduce(
    (s, x) => s + (x.aggregated_value ?? 0),
    0,
  );
}

function toCustomerId(
  cust: string | Stripe.Customer | Stripe.DeletedCustomer,
): string {
  if (typeof cust === 'string') return cust;

  return cust.id as string;
}

async function main(tier: [number, number]) {
  const priceMap = await loadPriceMapping(tier);

  if (priceMap.size === 0) {
    console.log(`Aucun mapping price ${tier[0]} -> ${tier[1]} trouvé`);
    process.exit(0);
  }

  let examined = 0;
  let modified = 0;
  let copiedTotal = 0;

  for (const status of [
    'active',
    'trialing',
  ] as Array<Stripe.SubscriptionListParams.Status>) {
    let starting_after: string | undefined;

    while (true) {
      const subs = await stripe.subscriptions.list({
        status,
        limit: 100,
        ...(starting_after ? { starting_after } : {}),
        price: priceMap.get(PRODUCT_ID)?.sourcePriceId,
        expand: ['data.items.data.price'],
      });

      for (const sub of subs.data) {
        examined++;
        const periodStart = sub.current_period_start as number;
        const nowTs = Math.floor(Date.now() / 1000);
        const customerId = toCustomerId(sub.customer);

        const targets = sub.items.data.filter((it) => {
          const m = priceMap.get(it.price.product as string);

          return m && it.price.id === m.sourcePriceId;
        });

        if (targets.length === 0) continue;

        const item = targets[0];

        const meterId = item.price.recurring?.meter;

        if (!meterId) continue; // pas un meter moderne

        const mapping = priceMap.get(item.price.product as string)!;

        const total = await getCurrentPeriodTotalUsageMeters({
          meterId,
          customerId,
          start: periodStart,
          end: nowTs,
        });

        let newItemId: string;

        if (DRY_RUN) {
          console.log(
            `[DRY_RUN] CREATE subscription_item price=${mapping.targetPriceId} subscription=${sub.id}`,
          );
          newItemId = `dry_${Date.now()}`;
        } else {
          const created = await stripe.subscriptionItems.create({
            subscription: sub.id,
            price: mapping.targetPriceId,
            ...(item.quantity ? { quantity: item.quantity } : {}),
          });

          newItemId = created.id;
        }
        await sleep(SLEEP_MS);

        if (total > 0) {
          if (DRY_RUN) {
            console.log(
              `[DRY_RUN] USAGE new_si=${newItemId} usage=${total * 1000}}`,
            );
            copiedTotal += total;
          } else {
            await stripe.subscriptionItems.createUsageRecord(newItemId, {
              quantity: total * 1000,
              timestamp: nowTs,
              action: 'increment',
            });
          }
          copiedTotal += total;
          await sleep(SLEEP_MS);
        }

        if (DRY_RUN) {
          console.log(
            `[DRY_RUN] DELETE ${item.id}?clear_usage=true (total_usage=${total})`,
          );
        } else {
          await stripe.subscriptionItems.del(item.id, { clear_usage: true });
        }
        await sleep(SLEEP_MS);

        modified++;
        console.log('\n');
      }

      if (!subs.has_more) break;
      starting_after = subs.data[subs.data.length - 1].id;
    }
  }
  console.log(
    `Terminé [${tier[0]} -> ${tier[1]}]. Subscriptions examinées: ${examined}. Modifiées: ${modified}.`,
  );
}

for (const tier of tiers) {
  main(tier).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
