import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { type CoreApiClient } from 'twenty-client-sdk/core';

type RecordData = Record<string, unknown>;
type Filter = Record<string, unknown> & { or?: Filter[]; and?: Filter[] };
type Selection = Record<
  string,
  {
    __args: { filter?: Filter; data?: RecordData; id?: string; first?: number };
  }
>;
export class SessionParticipantsClient {
  records: Record<string, RecordData[]> = {
    classSessions: [],
    people: [],
    studioProducts: [],
    studioPayments: [],
    studioSessionOperations: [],
    studioBookings: [],
    studioEvents: [],
    studioMemberships: ['one', 'two'].map((id) => ({
      id: 'membership-' + id,
      personId: 'person-' + id,
      productId: 'product',
      status: 'ACTIVE',
      mutationLock: null, completionLockedAt: null,
      activatedAt: '2020-01-01T00:00:00.000Z',
      expiresOn: null,
      purchaseIdempotencyKey: 'paid-' + id,
      visitsGranted: 8,
      visitsAvailable: 8,
      visitsReserved: 0,
      visitsConsumed: 0,
    })),
    membershipTransactions: ['one', 'two'].map((id) => ({
      id: 'grant-' + id,
      membershipId: 'membership-' + id,
      transactionType: 'GRANT',
      visitDelta: 8,
      occurredAt: '2020-01-01T00:00:00.000Z',
    })),
  };
  private readonly useUuid: boolean;
  constructor(useUuid = false) {
    this.useUuid = useUuid;
    if (useUuid) {
      const identifiers = new Map(
        [
          'person-one',
          'person-two',
          'membership-one',
          'membership-two',
          'product',
          'grant-one',
          'grant-two',
        ].map((key) => [key, randomUUID()]),
      );
      for (const records of Object.values(this.records))
        for (const record of records)
          for (const [key, value] of Object.entries(record))
            if (typeof value === 'string' && identifiers.has(value))
              record[key] = identifiers.get(value)!;
    }
  }
  bookingAttempts = 0;
  failSecondBooking = false;
  failBookingEvent = false;
  failPaymentEvent = false;
  failPaymentLink = false;
  loseBookingEventResponse = false;
  nextId = 1;
  matches(record: RecordData, filter: Filter = {}): boolean {
    if (filter.and)
      return filter.and.every((item) => this.matches(record, item));
    if (filter.or) return filter.or.some((item) => this.matches(record, item));
    return Object.entries(filter).every(([key, value]) => {
      const condition = value as { eq?: unknown; is?: string; in?: unknown[] };
      return condition.is === 'NULL'
        ? record[key] === null
        : condition.in
          ? condition.in.includes(record[key])
          : record[key] === condition.eq;
    });
  }
  node(record: RecordData): RecordData {
    const result = { ...record };
    for (const relation of [
      'person',
      'membership',
      'product',
      'classSession',
      'booking',
    ])
      if (record[relation + 'Id'])
        result[relation] = { id: record[relation + 'Id'] };
    if (record.productId)
      result.product = {
        id: record.productId,
        name: 'Пакет',
        category: record.category ?? 'GROUP_PACKAGE',
        sessionFormat: record.format ?? 'GROUP_REFORMER',
        durationMinutes: 55,
      };
    return result;
  }
  async query(selection: Selection) {
    return Object.fromEntries(
      Object.entries(selection).map(([key, { __args: args }]) => [
        key,
        {
          edges: this.records[key]
            .filter((record) => this.matches(record, args.filter))
            .map((record) => ({ node: this.node(record) })),
          pageInfo: { hasNextPage: false },
        },
      ]),
    );
  }
  async mutation(selection: Selection) {
    const [operation, { __args: args }] = Object.entries(selection)[0];
    if (
      operation === 'createStudioEvent' &&
      ['PAYMENT_CONFIRMED', 'PAYMENT_EXPECTED'].includes(
        String(args.data?.eventType),
      ) &&
      this.failPaymentEvent
    ) {
      this.failPaymentEvent = false;
      throw Error('Payment audit failed');
    }
    if (operation === 'updateStudioPayment' && this.failPaymentLink) {
      this.failPaymentLink = false;
      throw Error('Payment link failed');
    }
    if (
      operation === 'createStudioEvent' &&
      args.data?.eventType === 'BOOKING_CREATED' &&
      this.failBookingEvent
    ) {
      this.failBookingEvent = false;
      throw new Error('Audit write failed');
    }
    if (
      operation === 'createStudioBooking' &&
      ++this.bookingAttempts === 2 &&
      this.failSecondBooking
    ) {
      this.failSecondBooking = false;
      throw new Error('Second booking failed');
    }
    const resources: Record<string, string> = {
      createClassSession: 'classSessions',
      createStudioSessionOperation: 'studioSessionOperations',
      updateStudioSessionOperations: 'studioSessionOperations',
      updateClassSessions: 'classSessions',
      createStudioBooking: 'studioBookings',
      createStudioPayment: 'studioPayments',
      updateStudioPayment: 'studioPayments',
      createStudioEvent: 'studioEvents',
      createMembershipTransaction: 'membershipTransactions',
      updateClassSession: 'classSessions',
      updateStudioMembership: 'studioMemberships',
      updateStudioMemberships: 'studioMemberships',
    };
    const records = this.records[resources[operation]];
    if (
      operation === 'updateStudioMemberships' ||
      operation === 'updateClassSessions' ||
      operation === 'updateStudioSessionOperations'
    ) {
      const matched = records.filter((record) =>
        this.matches(record, args.filter),
      );
      for (const record of matched) Object.assign(record, args.data);
      return { [operation]: matched.map((record) => this.node(record)) };
    }
    if (operation.startsWith('update')) {
      const record = records.find((item) => item.id === args.id);
      assert.ok(record);
      Object.assign(record, args.data);
      return { [operation]: this.node(record) };
    }
    const data: RecordData = {
      id: this.useUuid ? randomUUID() : 'generated-' + this.nextId++,
      ...(operation === 'createClassSession' ? { mutationLock: null, completionLockedAt: null } : {}),
      ...args.data,
    };
    if (
      records.some(
        (record) =>
          record.id === data.id ||
          (data.idempotencyKey &&
            record.idempotencyKey === data.idempotencyKey) ||
          (data.operationKey && record.operationKey === data.operationKey),
      )
    )
      throw new Error('duplicate entry');
    records.push(data);
    if (
      operation === 'createStudioEvent' &&
      args.data?.eventType === 'BOOKING_CREATED' &&
      this.loseBookingEventResponse
    ) {
      this.loseBookingEventResponse = false;
      throw new Error('Audit response lost');
    }
    return { [operation]: this.node(data) };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
