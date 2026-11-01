import { studioDate } from 'src/logic-functions/utils/studio-date';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type ConfirmPackagePaymentInput,
  getPackageDates,
  type PackageProduct,
  validatePackagePayment,
} from 'src/logic-functions/utils/package-payment';
import {
  calculateLedgerBalance,
  type LedgerEntry,
} from 'src/logic-functions/utils/past-attendance';
import { recordPackagePaymentEvent } from 'src/logic-functions/utils/payment-event';

type RelatedRecord = { id: string } | null;

type PaymentNode = {
  id: string;
  idempotencyKey?: string | null;
  externalId?: string | null;
  amount?: { amountMicros: number; currencyCode: string } | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  person?: RelatedRecord;
  membership?: RelatedRecord;
};

type MembershipNode = {
  id: string;
  purchaseIdempotencyKey?: string | null;
  product?: RelatedRecord;
};

type TransactionNode = {
  id: string;
  membership?: RelatedRecord;
  payment?: RelatedRecord;
};

type PackagePaymentExecutionContext = {
  userWorkspaceId: string | null;
};

export type ConfirmPackagePaymentResult =
  | {
      success: true;
      duplicate: boolean;
      paymentId: string;
      membershipId: string;
      transactionId: string;
      visitsAvailable: number;
    }
  | {
      success: false;
      status: number;
      code: string;
      message: string;
    };

const edgesToNodes = <TData>(
  data:
    | {
        edges?: Array<{ node: TData }> | null;
      }
    | null
    | undefined,
): TData[] => data?.edges?.map(({ node }) => node) ?? [];

const queryFirst = async <TData>(
  client: CoreApiClient,
  query: object,
  resultKey: string,
): Promise<TData | null> => {
  const result = (await client.query(query as never)) as unknown as Record<
    string,
    { edges?: Array<{ node: TData }> }
  >;

  return edgesToNodes(result[resultKey])[0] ?? null;
};

const findProduct = async (
  client: CoreApiClient,
  productId: string,
): Promise<PackageProduct | null> =>
  queryFirst<PackageProduct>(
    client,
    {
      studioProducts: {
        __args: { filter: { id: { eq: productId } }, first: 1 },
        edges: {
          node: {
            id: true,
            name: true,
            category: true,
            visitsIncluded: true,
            price: { amountMicros: true, currencyCode: true },
            validityDays: true,
            activationLimitDays: true,
            isActive: true,
            validFrom: true,
            validTo: true,
          },
        },
      },
    },
    'studioProducts',
  );

const personExists = async (
  client: CoreApiClient,
  personId: string,
): Promise<boolean> =>
  (await queryFirst<{ id: string }>(
    client,
    {
      people: {
        __args: { filter: { id: { eq: personId } }, first: 1 },
        edges: { node: { id: true } },
      },
    },
    'people',
  )) !== null;

const findPaymentByKey = async (
  client: CoreApiClient,
  idempotencyKey: string,
): Promise<PaymentNode | null> =>
  queryFirst<PaymentNode>(
    client,
    {
      studioPayments: {
        __args: {
          filter: { idempotencyKey: { eq: idempotencyKey } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            idempotencyKey: true,
            externalId: true,
            amount: { amountMicros: true, currencyCode: true },
            paymentMethod: true,
            paidAt: true,
            person: { id: true },
            membership: { id: true },
          },
        },
      },
    },
    'studioPayments',
  );

const findPaymentByExternalId = async (
  client: CoreApiClient,
  externalId: string,
): Promise<PaymentNode | null> =>
  queryFirst<PaymentNode>(
    client,
    {
      studioPayments: {
        __args: { filter: { externalId: { eq: externalId } }, first: 1 },
        edges: { node: { id: true, idempotencyKey: true, externalId: true } },
      },
    },
    'studioPayments',
  );

const findMembershipByKey = async (
  client: CoreApiClient,
  idempotencyKey: string,
): Promise<MembershipNode | null> =>
  queryFirst<MembershipNode>(
    client,
    {
      studioMemberships: {
        __args: {
          filter: { purchaseIdempotencyKey: { eq: idempotencyKey } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            purchaseIdempotencyKey: true,
            product: { id: true },
          },
        },
      },
    },
    'studioMemberships',
  );

const findTransactionByKey = async (
  client: CoreApiClient,
  idempotencyKey: string,
): Promise<TransactionNode | null> =>
  queryFirst<TransactionNode>(
    client,
    {
      membershipTransactions: {
        __args: {
          filter: { idempotencyKey: { eq: idempotencyKey } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            membership: { id: true },
            payment: { id: true },
          },
        },
      },
    },
    'membershipTransactions',
  );

const createMembership = async (
  client: CoreApiClient,
  input: ConfirmPackagePaymentInput,
  product: PackageProduct,
  paidAt: Date,
): Promise<MembershipNode> => {
  const dates = getPackageDates(paidAt, product);
  const result = (await client.mutation({
    createStudioMembership: {
      __args: {
        data: {
          name: `${product.name} · ${studioDate(paidAt)}`,
          status: 'ACTIVE',
          soldAt: paidAt.toISOString(),
          activatedAt: paidAt.toISOString(),
          activationDeadline: dates.activationDeadline,
          expiresOn: dates.expiresOn,
          visitsGranted: 0,
          visitsReserved: 0,
          visitsConsumed: 0,
          visitsAvailable: 0,
          purchasePrice: product.price,
          purchaseIdempotencyKey: input.idempotencyKey,
          personId: input.personId,
          productId: input.productId,
        },
      },
      id: true,
      purchaseIdempotencyKey: true,
      product: { id: true },
    },
  } as never)) as unknown as { createStudioMembership?: MembershipNode };

  if (!result.createStudioMembership?.id) {
    throw new Error('Не удалось создать пакет клиента.');
  }

  return result.createStudioMembership;
};

const createPayment = async (
  client: CoreApiClient,
  input: ConfirmPackagePaymentInput,
  product: PackageProduct,
  membershipId: string,
): Promise<PaymentNode> => {
  const result = (await client.mutation({
    createStudioPayment: {
      __args: {
        data: {
          name: `${product.name} · ${input.amount} ₽`,
          amount: product.price,
          paymentMethod: input.paymentMethod,
          status: 'PAID',
          paidAt: new Date(input.paidAt).toISOString(),
          fiscalReceiptId: input.fiscalReceiptId?.trim() || null,
          externalId: input.externalId?.trim() || null,
          idempotencyKey: input.idempotencyKey,
          personId: input.personId,
          membershipId,
        },
      },
      id: true,
      idempotencyKey: true,
    },
  } as never)) as unknown as { createStudioPayment?: PaymentNode };

  if (!result.createStudioPayment?.id) {
    throw new Error('Не удалось создать оплату.');
  }

  return result.createStudioPayment;
};

const createGrantTransaction = async (
  client: CoreApiClient,
  input: ConfirmPackagePaymentInput,
  product: PackageProduct,
  membershipId: string,
  paymentId: string,
  actorId: string | null,
): Promise<TransactionNode> => {
  const transactionKey = `package-payment:${input.idempotencyKey}`;
  const result = (await client.mutation({
    createMembershipTransaction: {
      __args: {
        data: {
          name: `Начисление · ${product.name}`,
          transactionType: 'GRANT',
          visitDelta: product.visitsIncluded,
          daysDelta: 0,
          occurredAt: new Date(input.paidAt).toISOString(),
          idempotencyKey: transactionKey,
          reason: actorId
            ? `Оплата пакета; userWorkspaceId=${actorId}`
            : 'Оплата пакета',
          membershipId,
          paymentId,
        },
      },
      id: true,
      membership: { id: true },
      payment: { id: true },
    },
  } as never)) as unknown as {
    createMembershipTransaction?: TransactionNode;
  };

  if (!result.createMembershipTransaction?.id) {
    throw new Error('Не удалось создать операцию начисления.');
  }

  return result.createMembershipTransaction;
};

const activateMembershipBalance = async (
  client: CoreApiClient,
  membershipId: string,
): Promise<number> => {
  const transactions = (await client.query({
    membershipTransactions: {
      __args: { filter: { membershipId: { eq: membershipId } }, first: 1000 },
      edges: {
        node: {
          id: true,
          transactionType: true,
          visitDelta: true,
          occurredAt: true,
        },
      },
    },
  } as never)) as unknown as {
    membershipTransactions?: { edges?: Array<{ node: LedgerEntry }> };
  };
  const entries = edgesToNodes(transactions.membershipTransactions);
  if (entries.length === 1000)
    throw new Error('Журнал пакета слишком велик для безопасной сверки.');
  const balance = calculateLedgerBalance(entries);
  if (!balance.success)
    throw new Error('Журнал пакета требует проверки владельцем.');
  await client.mutation({
    updateStudioMembership: {
      __args: {
        id: membershipId,
        data: {
          status: balance.available === 0 ? 'EXHAUSTED' : 'ACTIVE',
          visitsGranted: balance.granted,
          visitsReserved: balance.reserved,
          visitsConsumed: balance.consumed,
          visitsAvailable: balance.available,
        },
      },
      id: true,
    },
  } as never);
  return balance.available;
};

const conflict = (
  code: string,
  message: string,
): ConfirmPackagePaymentResult => ({
  success: false,
  status: 409,
  code,
  message,
});

export const confirmPackagePayment = async (
  rawInput: ConfirmPackagePaymentInput,
  context: PackagePaymentExecutionContext,
  client = new CoreApiClient(),
  coordinate?: (membershipId: string, input: ConfirmPackagePaymentInput) => Promise<ConfirmPackagePaymentResult>,
): Promise<ConfirmPackagePaymentResult> => {
  const input: ConfirmPackagePaymentInput = {
    ...rawInput,
    personId: String(rawInput.personId ?? '').trim(),
    productId: String(rawInput.productId ?? '').trim(),
    paidAt: String(rawInput.paidAt ?? '').trim(),
    amount: Number(rawInput.amount),
    externalId: String(rawInput.externalId ?? '').trim() || undefined,
    fiscalReceiptId: String(rawInput.fiscalReceiptId ?? '').trim() || undefined,
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
  };
  const transactionKey = `package-payment:${input.idempotencyKey}`;

  const product = await findProduct(client, input.productId);
  if (product === null) {
    return {
      success: false,
      status: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Продукт не найден.',
    };
  }

  const validation = validatePackagePayment(input, product);
  if (!validation.success) {
    return { ...validation, status: 400 };
  }

  if (!(await personExists(client, input.personId))) {
    return {
      success: false,
      status: 404,
      code: 'PERSON_NOT_FOUND',
      message: 'Клиент не найден.',
    };
  }

  if (input.externalId !== undefined) {
    const externalPayment = await findPaymentByExternalId(
      client,
      input.externalId,
    );
    if (
      externalPayment !== null &&
      externalPayment.idempotencyKey !== input.idempotencyKey
    ) {
      return conflict(
        'EXTERNAL_ID_CONFLICT',
        'Оплата с таким внешним ID уже существует.',
      );
    }
  }

  let membership = await findMembershipByKey(client, input.idempotencyKey);
  let payment = await findPaymentByKey(client, input.idempotencyKey);

  if (payment?.person?.id && payment.person.id !== input.personId) {
    return conflict(
      'IDEMPOTENCY_CONFLICT',
      'Ключ операции уже использован для другого клиента.',
    );
  }

  if (membership?.product?.id && membership.product.id !== input.productId) {
    return conflict(
      'IDEMPOTENCY_CONFLICT',
      'Ключ операции уже использован для другого продукта.',
    );
  }

  if (
    payment !== null &&
    (payment.amount?.amountMicros !== product.price.amountMicros ||
      payment.paymentMethod !== input.paymentMethod ||
      payment.paidAt !== validation.paidAt.toISOString())
  ) {
    return conflict(
      'IDEMPOTENCY_CONFLICT',
      'Ключ операции уже использован с другими параметрами оплаты.',
    );
  }

  if (membership === null) {
    membership = await createMembership(
      client,
      input,
      product,
      validation.paidAt,
    );
  }

  if (coordinate) return coordinate(membership.id, input);

  if (payment === null) {
    payment = await createPayment(client, input, product, membership.id);
  } else if (
    payment.membership?.id &&
    payment.membership.id !== membership.id
  ) {
    return conflict(
      'IDEMPOTENCY_CONFLICT',
      'Ключ операции уже связан с другим пакетом.',
    );
  }

  let transaction = await findTransactionByKey(client, transactionKey);
  const duplicate = transaction !== null;

  if (transaction === null) {
    transaction = await createGrantTransaction(
      client,
      input,
      product,
      membership.id,
      payment.id,
      context.userWorkspaceId,
    );
  } else if (
    transaction.membership?.id !== membership.id ||
    transaction.payment?.id !== payment.id
  ) {
    return conflict(
      'IDEMPOTENCY_CONFLICT',
      'Ключ начисления уже связан с другой покупкой.',
    );
  }

  const visitsAvailable = await activateMembershipBalance(
    client,
    membership.id,
  );
  await recordPackagePaymentEvent(
    {
      paymentId: payment.id,
      membershipId: membership.id,
      transactionId: transaction.id,
      personId: input.personId,
      productId: input.productId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paidAt: validation.paidAt.toISOString(),
      idempotencyKey: input.idempotencyKey,
    },
    client,
  );

  return {
    success: true,
    duplicate,
    paymentId: payment.id,
    membershipId: membership.id,
    transactionId: transaction.id,
    visitsAvailable,
  };
};
