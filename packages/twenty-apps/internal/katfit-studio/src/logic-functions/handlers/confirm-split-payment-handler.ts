import { studioDate } from 'src/logic-functions/utils/studio-date';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { calculateLedgerBalance, type LedgerEntry } from 'src/logic-functions/utils/past-attendance';
import { getPackageDates } from 'src/logic-functions/utils/package-payment';
import { type ConfirmSplitPaymentInput, type SplitPaymentPart, type SplitProduct, validateSplitPayment } from 'src/logic-functions/utils/split-payment';

type RelatedRecord = { id: string } | null;

type PairNode = {
  id: string;
  name: string;
  status: string;
  firstPerson: RelatedRecord;
  secondPerson: RelatedRecord;
};

type MembershipNode = { id: string; product: RelatedRecord; pair: RelatedRecord };
type PaymentNode = { id: string; idempotencyKey?: string | null; membership: RelatedRecord };

export type ConfirmSplitPaymentResult =
  | { success: true; duplicate: boolean; membershipId: string; paymentIds: string[]; visitsAvailable: number }
  | { success: false; status: number; code: string; message: string };

const edgesToNodes = <TData>(
  data: { edges?: Array<{ node: TData }> } | null | undefined,
): TData[] => data?.edges?.map(({ node }) => node) ?? [];

const queryFirst = async <TData>(client: CoreApiClient, query: object, resultKey: string): Promise<TData | null> => {
  const result = (await client.query(query as never)) as unknown as Record<string, { edges?: Array<{ node: TData }> }>;
  return edgesToNodes(result[resultKey])[0] ?? null;
};

const findPair = (client: CoreApiClient, pairId: string): Promise<PairNode | null> =>
  queryFirst<PairNode>(client, {
    studioPairs: { __args: { filter: { id: { eq: pairId } }, first: 1 }, edges: { node: { id: true, name: true, status: true, firstPerson: { id: true }, secondPerson: { id: true } } } },
  }, 'studioPairs');

const findProduct = (client: CoreApiClient, productId: string): Promise<SplitProduct | null> =>
  queryFirst<SplitProduct>(client, {
    studioProducts: { __args: { filter: { id: { eq: productId } }, first: 1 }, edges: { node: { id: true, name: true, category: true, visitsIncluded: true, price: { amountMicros: true, currencyCode: true }, isActive: true, validFrom: true, validTo: true } } },
  }, 'studioProducts');

const findMembershipByKey = (client: CoreApiClient, idempotencyKey: string): Promise<MembershipNode | null> =>
  queryFirst<MembershipNode>(client, {
    studioMemberships: { __args: { filter: { purchaseIdempotencyKey: { eq: idempotencyKey } }, first: 1 }, edges: { node: { id: true, product: { id: true }, pair: { id: true } } } },
  }, 'studioMemberships');

const findPaymentByKey = (client: CoreApiClient, idempotencyKey: string): Promise<PaymentNode | null> =>
  queryFirst<PaymentNode>(client, {
    studioPayments: { __args: { filter: { idempotencyKey: { eq: idempotencyKey } }, first: 1 }, edges: { node: { id: true, idempotencyKey: true, membership: { id: true } } } },
  }, 'studioPayments');

const createMembership = async (client: CoreApiClient, input: ConfirmSplitPaymentInput, product: SplitProduct, paidAt: Date): Promise<MembershipNode> => {
  const dates = getPackageDates(paidAt, product);
  const result = (await client.mutation({
    createStudioMembership: { __args: { data: {
      name: `Сплит-блок · ${studioDate(paidAt)}`,
      status: 'ACTIVE', soldAt: paidAt.toISOString(), activatedAt: paidAt.toISOString(),
      activationDeadline: dates.activationDeadline, expiresOn: dates.expiresOn,
      visitsGranted: 0, visitsReserved: 0, visitsConsumed: 0, visitsAvailable: 0,
      purchasePrice: product.price, purchaseIdempotencyKey: `split-block:${input.idempotencyKey}`,
      pairId: input.pairId, productId: input.productId,
    } }, id: true, product: { id: true }, pair: { id: true } },
  } as never)) as unknown as { createStudioMembership?: MembershipNode };
  if (!result.createStudioMembership?.id) throw new Error('Не удалось создать общий сплит-блок.');
  return result.createStudioMembership;
};

const createPayment = async (client: CoreApiClient, part: SplitPaymentPart, paymentKey: string, membershipId: string, paidAt: Date): Promise<PaymentNode> => {
  const result = (await client.mutation({
    createStudioPayment: { __args: { data: {
      name: `Оплата сплит-блока · ${part.amount} ₽`,
      amount: { amountMicros: Math.round(part.amount * 1_000_000), currencyCode: 'RUB' },
      paymentMethod: part.paymentMethod, status: 'PAID', paidAt: paidAt.toISOString(),
      fiscalReceiptId: part.fiscalReceiptId?.trim() || null, externalId: part.externalId?.trim() || null,
      idempotencyKey: paymentKey, personId: part.personId, membershipId,
    } }, id: true, idempotencyKey: true, membership: { id: true } },
  } as never)) as unknown as { createStudioPayment?: PaymentNode };
  if (!result.createStudioPayment?.id) throw new Error('Не удалось создать оплату сплит-блока.');
  return result.createStudioPayment;
};

const grantVisits = async (client: CoreApiClient, membershipId: string, product: SplitProduct, paidAt: Date, idempotencyKey: string): Promise<number> => {
  const transactionKey = `split-grant:${idempotencyKey}`;
  const existing = await queryFirst<{ id: string }>(client, {
    membershipTransactions: { __args: { filter: { idempotencyKey: { eq: transactionKey } }, first: 1 }, edges: { node: { id: true } } },
  }, 'membershipTransactions');
  if (existing === null) {
    await client.mutation({ createMembershipTransaction: { __args: { data: {
      name: 'Начисление · сплит-блок', transactionType: 'GRANT', visitDelta: product.visitsIncluded,
      daysDelta: 0, occurredAt: paidAt.toISOString(), idempotencyKey: transactionKey,
      reason: 'Полностью оплаченный общий сплит-блок', membershipId,
    } }, id: true } } as never);
  }
  const result = (await client.query({
    membershipTransactions: { __args: { filter: { membershipId: { eq: membershipId } }, first: 1000 }, edges: { node: { id: true, transactionType: true, visitDelta: true, occurredAt: true } } },
  } as never)) as unknown as { membershipTransactions?: { edges?: Array<{ node: LedgerEntry }> } };
  const entries = edgesToNodes(result.membershipTransactions);
  if (entries.length === 1000) throw new Error('Журнал сплит-блока слишком велик для безопасной сверки.');
  const balance = calculateLedgerBalance(entries);
  if (!balance.success) throw new Error('Журнал сплит-блока требует проверки владельцем.');
  await client.mutation({ updateStudioMembership: { __args: { id: membershipId, data: {
    status: balance.available === 0 ? 'EXHAUSTED' : 'ACTIVE', visitsGranted: balance.granted,
    visitsReserved: balance.reserved, visitsConsumed: balance.consumed, visitsAvailable: balance.available,
  } }, id: true } } as never);
  return balance.available;
};

const failure = (status: number, code: string, message: string): ConfirmSplitPaymentResult => ({ success: false, status, code, message });

export const confirmSplitPayment = async (rawInput: ConfirmSplitPaymentInput, client = new CoreApiClient(), coordinate?: (membershipId: string, input: ConfirmSplitPaymentInput) => Promise<ConfirmSplitPaymentResult>): Promise<ConfirmSplitPaymentResult> => {
  const input: ConfirmSplitPaymentInput = {
    pairId: String(rawInput.pairId ?? '').trim(), productId: String(rawInput.productId ?? '').trim(),
    paidAt: String(rawInput.paidAt ?? '').trim(), payments: Array.isArray(rawInput.payments) ? rawInput.payments.map((part) => ({ ...part, personId: String(part.personId ?? '').trim(), amount: Number(part.amount) })) : [],
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
  };
  const [pair, product] = await Promise.all([findPair(client, input.pairId), findProduct(client, input.productId)]);
  if (pair === null) return failure(404, 'PAIR_NOT_FOUND', 'Пара не найдена.');
  if (pair.status !== 'ACTIVE') return failure(409, 'PAIR_NOT_ACTIVE', 'Нельзя продать блок неактивной паре.');
  if (product === null) return failure(404, 'PRODUCT_NOT_FOUND', 'Продукт не найден.');
  const pairPersonIds = [pair.firstPerson?.id ?? '', pair.secondPerson?.id ?? ''];
  const validation = validateSplitPayment(input, product, pairPersonIds);
  if (!validation.success) return { ...validation, status: 400 };
  const membershipKey = `split-block:${input.idempotencyKey}`;
  let membership = await findMembershipByKey(client, membershipKey);
  if (membership !== null && (membership.product?.id !== input.productId || membership.pair?.id !== input.pairId)) return failure(409, 'IDEMPOTENCY_CONFLICT', 'Ключ операции уже связан с другим блоком.');
  if (membership === null) membership = await createMembership(client, input, product, validation.paidAt);
  if (coordinate) return coordinate(membership.id, input);
  const paymentIds: string[] = [];
  let duplicate = true;
  for (const [index, part] of input.payments.entries()) {
    const paymentKey = `split-payment:${input.idempotencyKey}:${index}`;
    let payment = await findPaymentByKey(client, paymentKey);
    if (payment !== null && payment.membership?.id !== membership.id) return failure(409, 'IDEMPOTENCY_CONFLICT', 'Ключ оплаты уже связан с другим блоком.');
    if (payment === null) { payment = await createPayment(client, part, paymentKey, membership.id, validation.paidAt); duplicate = false; }
    paymentIds.push(payment.id);
  }
  const visitsAvailable = await grantVisits(client, membership.id, product, validation.paidAt, input.idempotencyKey);
  return { success: true, duplicate, membershipId: membership.id, paymentIds, visitsAvailable };
};
