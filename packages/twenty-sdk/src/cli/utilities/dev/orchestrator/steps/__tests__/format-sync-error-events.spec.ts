import { formatSyncErrorEvents } from '@/cli/utilities/dev/orchestrator/steps/format-sync-error-events';

describe('formatSyncErrorEvents', () => {
  it('should return null for null input', () => {
    expect(formatSyncErrorEvents(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(formatSyncErrorEvents(undefined)).toBeNull();
  });

  it('should return null for non-object input', () => {
    expect(formatSyncErrorEvents('string error')).toBeNull();
    expect(formatSyncErrorEvents(42)).toBeNull();
  });

  it('should return null when extensions is missing', () => {
    expect(formatSyncErrorEvents({ message: 'error' })).toBeNull();
  });

  it('should return null when extensions.errors is missing', () => {
    expect(
      formatSyncErrorEvents({
        extensions: { summary: { totalErrors: 1 } },
      }),
    ).toBeNull();
  });

  it('should return null when extensions.summary is missing', () => {
    expect(
      formatSyncErrorEvents({
        extensions: { errors: {} },
      }),
    ).toBeNull();
  });

  it('should format a single error', () => {
    const events = formatSyncErrorEvents({
      extensions: {
        errors: {
          fieldMetadata: [
            {
              flatEntityMinimalInformation: {
                universalIdentifier: 'field-uuid-1',
              },
              errors: [
                {
                  code: 'INVALID_NAME',
                  message: 'Field name is invalid',
                },
              ],
            },
          ],
        },
        summary: { fieldMetadata: 1, totalErrors: 1 },
      },
    });

    expect(events).not.toBeNull();
    expect(events).toHaveLength(3);
    expect(events?.[0]).toEqual({
      message: 'Sync failed with 1 error',
      status: 'error',
    });
    expect(events?.[1]).toEqual({
      message: 'fieldMetadata: 1 error',
      status: 'error',
    });
    expect(events?.[2].message).toContain('INVALID_NAME');
    expect(events?.[2].message).toContain('Field name is invalid');
    expect(events?.[2].message).toContain('field-uuid-1');
  });

  it('should format multiple errors across metadata types', () => {
    const events = formatSyncErrorEvents({
      extensions: {
        errors: {
          fieldMetadata: [
            {
              errors: [
                { code: 'ERR_1', message: 'First error' },
                { code: 'ERR_2', message: 'Second error' },
              ],
            },
          ],
          objectMetadata: [
            {
              errors: [{ code: 'ERR_3', message: 'Third error' }],
            },
          ],
        },
        summary: { fieldMetadata: 2, objectMetadata: 1, totalErrors: 3 },
      },
    });

    expect(events).not.toBeNull();
    expect(events?.[0].message).toBe('Sync failed with 3 errors');
    expect(events?.[1].message).toBe('fieldMetadata: 2 errors');
    expect(events?.[2].message).toContain('1. ERR_1');
    expect(events?.[3].message).toContain('2. ERR_2');
    expect(events?.[4].message).toBe('objectMetadata: 1 error');
    expect(events?.[5].message).toContain('1. ERR_3');
  });

  it('should format errors with details for both objectMetadata and fieldMetadata', () => {
    const events = formatSyncErrorEvents({
      extensions: {
        errors: {
          objectMetadata: [
            {
              flatEntityMinimalInformation: {
                universalIdentifier: 'obj-uuid-1',
              },
              errors: [
                {
                  code: 'DUPLICATE_NAME',
                  message: 'An object with this name already exists',
                  value: 'postCard',
                },
              ],
            },
          ],
          fieldMetadata: [
            {
              flatEntityMinimalInformation: {
                universalIdentifier: 'field-uuid-1',
              },
              errors: [
                {
                  code: 'INVALID_TYPE',
                  message: 'Field type is not supported',
                  value: 'UNKNOWN_TYPE',
                },
              ],
            },
            {
              flatEntityMinimalInformation: {
                universalIdentifier: 'field-uuid-2',
              },
              errors: [
                {
                  code: 'MISSING_RELATION_TARGET',
                  message: 'Relation target object not found',
                },
              ],
            },
          ],
        },
        summary: { objectMetadata: 1, fieldMetadata: 2, totalErrors: 3 },
      },
    });

    expect(events).not.toBeNull();
    expect(events).toHaveLength(6);

    expect(events?.[0].message).toBe('Sync failed with 3 errors');

    expect(events?.[1].message).toBe('objectMetadata: 1 error');
    expect(events?.[2].message).toContain('DUPLICATE_NAME');
    expect(events?.[2].message).toContain('value: postCard');
    expect(events?.[2].message).toContain('universalIdentifier: obj-uuid-1');

    expect(events?.[3].message).toBe('fieldMetadata: 2 errors');
    expect(events?.[4].message).toContain('INVALID_TYPE');
    expect(events?.[4].message).toContain('value: UNKNOWN_TYPE');
    expect(events?.[4].message).toContain('universalIdentifier: field-uuid-1');
    expect(events?.[5].message).toContain('MISSING_RELATION_TARGET');
    expect(events?.[5].message).toContain('universalIdentifier: field-uuid-2');
    expect(events?.[5].message).not.toContain('value:');
  });

  it('should include value in details when present', () => {
    const events = formatSyncErrorEvents({
      extensions: {
        errors: {
          fieldMetadata: [
            {
              errors: [
                {
                  code: 'INVALID_VALUE',
                  message: 'Bad value',
                  value: 'some-bad-value',
                },
              ],
            },
          ],
        },
        summary: { fieldMetadata: 1, totalErrors: 1 },
      },
    });

    expect(events).not.toBeNull();
    expect(events?.[2].message).toContain('value: some-bad-value');
  });

  it('should omit details suffix when no value or universalIdentifier', () => {
    const events = formatSyncErrorEvents({
      extensions: {
        errors: {
          fieldMetadata: [
            {
              errors: [{ code: 'ERR', message: 'Something failed' }],
            },
          ],
        },
        summary: { fieldMetadata: 1, totalErrors: 1 },
      },
    });

    expect(events).not.toBeNull();
    expect(events?.[2].message).toBe('  1. ERR: Something failed');
  });

  it('should fall back to entries.length when summary count is missing for a metadata type', () => {
    const events = formatSyncErrorEvents({
      extensions: {
        errors: {
          fieldMetadata: [
            {
              errors: [
                { code: 'ERR_1', message: 'Error one' },
                { code: 'ERR_2', message: 'Error two' },
              ],
            },
          ],
        },
        summary: { totalErrors: 2 },
      },
    });

    expect(events).not.toBeNull();
    expect(events?.[1].message).toBe('fieldMetadata: 1 error');
  });

  it('should pluralize correctly for singular and plural counts', () => {
    const singleError = formatSyncErrorEvents({
      extensions: {
        errors: {
          objectMetadata: [
            {
              errors: [{ code: 'ERR', message: 'Error' }],
            },
          ],
        },
        summary: { objectMetadata: 1, totalErrors: 1 },
      },
    });

    expect(singleError?.[0].message).toBe('Sync failed with 1 error');
    expect(singleError?.[1].message).toBe('objectMetadata: 1 error');

    const multipleErrors = formatSyncErrorEvents({
      extensions: {
        errors: {
          objectMetadata: [
            {
              errors: [
                { code: 'ERR_1', message: 'Error 1' },
                { code: 'ERR_2', message: 'Error 2' },
              ],
            },
          ],
        },
        summary: { objectMetadata: 5, totalErrors: 5 },
      },
    });

    expect(multipleErrors?.[0].message).toBe('Sync failed with 5 errors');
    expect(multipleErrors?.[1].message).toBe('objectMetadata: 5 errors');
  });
});
