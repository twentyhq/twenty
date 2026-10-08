import { isOnDemandFieldResponseStale } from '@/object-record/record-field/on-demand/utils/isOnDemandFieldResponseStale';

const EARLIER_UPDATED_AT = '2026-10-08T08:00:00.000Z';
const REQUEST_UPDATED_AT = '2026-10-08T09:00:00.000Z';
const LATER_UPDATED_AT = '2026-10-08T10:00:00.000Z';

describe('isOnDemandFieldResponseStale', () => {
  it.each([null, { text: 'Locally edited transcript' }])(
    'preserves a local field change without an updated timestamp: %s',
    (transcript) => {
      expect(
        isOnDemandFieldResponseStale({
          fieldName: 'transcript',
          recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
          currentRecord: { updatedAt: REQUEST_UPDATED_AT, transcript },
          responseUpdatedAt: REQUEST_UPDATED_AT,
        }),
      ).toBe(true);
    },
  );

  it('accepts an unrelated local field change without an updated timestamp', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
        currentRecord: { updatedAt: REQUEST_UPDATED_AT, name: 'Changed name' },
        responseUpdatedAt: REQUEST_UPDATED_AT,
      }),
    ).toBe(false);
  });

  it.each([REQUEST_UPDATED_AT, LATER_UPDATED_AT])(
    'accepts a response at least as recent as the known record: %s',
    (responseUpdatedAt) => {
      expect(
        isOnDemandFieldResponseStale({
          fieldName: 'transcript',
          recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
          currentRecord: { updatedAt: REQUEST_UPDATED_AT },
          responseUpdatedAt,
        }),
      ).toBe(false);
    },
  );

  it('rejects a response older than an update received during loading', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
        currentRecord: { updatedAt: LATER_UPDATED_AT },
        responseUpdatedAt: REQUEST_UPDATED_AT,
      }),
    ).toBe(true);
  });

  it('preserves the request-start version if another response regresses the store', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: { updatedAt: LATER_UPDATED_AT },
        currentRecord: { updatedAt: EARLIER_UPDATED_AT },
        responseUpdatedAt: REQUEST_UPDATED_AT,
      }),
    ).toBe(true);
  });

  it.each([null, undefined])(
    'rejects a response when a previously loaded record disappeared: %s',
    (currentRecord) => {
      expect(
        isOnDemandFieldResponseStale({
          fieldName: 'transcript',
          recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
          currentRecord,
          responseUpdatedAt: LATER_UPDATED_AT,
        }),
      ).toBe(true);
    },
  );

  it('rejects a response for a record deleted during loading', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: {
          updatedAt: REQUEST_UPDATED_AT,
          deletedAt: null,
        },
        currentRecord: {
          updatedAt: LATER_UPDATED_AT,
          deletedAt: LATER_UPDATED_AT,
        },
        responseUpdatedAt: LATER_UPDATED_AT,
      }),
    ).toBe(true);
  });

  it.each(['', 'invalid-date'])(
    'rejects a response without a valid version: %s',
    (responseUpdatedAt) => {
      expect(
        isOnDemandFieldResponseStale({
          fieldName: 'transcript',
          recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
          currentRecord: { updatedAt: REQUEST_UPDATED_AT },
          responseUpdatedAt,
        }),
      ).toBe(true);
    },
  );

  it('accepts a response if the record was never in the store', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: undefined,
        currentRecord: undefined,
        responseUpdatedAt: REQUEST_UPDATED_AT,
      }),
    ).toBe(false);
  });

  it('accepts an unversioned response while the canonical record is unchanged', () => {
    const recordAtRequest = { updatedAt: REQUEST_UPDATED_AT };

    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest,
        currentRecord: recordAtRequest,
        responseUpdatedAt: undefined,
      }),
    ).toBe(false);
  });

  it('rejects an unversioned response after any canonical record update', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
        currentRecord: { updatedAt: REQUEST_UPDATED_AT },
        responseUpdatedAt: undefined,
      }),
    ).toBe(true);
  });

  it('rejects an unversioned response when a record arrived during loading', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: undefined,
        currentRecord: { updatedAt: REQUEST_UPDATED_AT },
        responseUpdatedAt: undefined,
      }),
    ).toBe(true);
  });

  it('accepts an unversioned response when no canonical record existed', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: null,
        currentRecord: undefined,
        responseUpdatedAt: undefined,
      }),
    ).toBe(false);
  });

  it('compares timestamps by time rather than their timezone representation', () => {
    expect(
      isOnDemandFieldResponseStale({
        fieldName: 'transcript',
        recordAtRequest: { updatedAt: REQUEST_UPDATED_AT },
        currentRecord: { updatedAt: REQUEST_UPDATED_AT },
        responseUpdatedAt: '2026-10-08T14:30:00.000+05:30',
      }),
    ).toBe(false);
  });
});
