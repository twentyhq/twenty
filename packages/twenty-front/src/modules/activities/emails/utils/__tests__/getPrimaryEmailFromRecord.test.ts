import { getPrimaryEmailFromRecord } from '@/activities/emails/utils/getPrimaryEmailFromRecord';

const makeRecord = (emails: unknown): Record<string, unknown> => ({ emails });

describe('getPrimaryEmailFromRecord', () => {
  it('should return the primary email when present', () => {
    const record = makeRecord({ primaryEmail: 'alice@example.com' });

    expect(getPrimaryEmailFromRecord(record)).toBe('alice@example.com');
  });

  it('should return null when emails is null', () => {
    const record = makeRecord(null);

    expect(getPrimaryEmailFromRecord(record)).toBeNull();
  });

  it('should return null when emails is undefined', () => {
    const record = makeRecord(undefined);

    expect(getPrimaryEmailFromRecord(record)).toBeNull();
  });

  it('should return null when emails is not an object', () => {
    const record = makeRecord('not-an-object');

    expect(getPrimaryEmailFromRecord(record)).toBeNull();
  });

  it('should return null when primaryEmail is missing', () => {
    const record = makeRecord({ additionalEmails: ['b@example.com'] });

    expect(getPrimaryEmailFromRecord(record)).toBeNull();
  });

  it('should return null when primaryEmail is an empty string', () => {
    const record = makeRecord({ primaryEmail: '' });

    expect(getPrimaryEmailFromRecord(record)).toBeNull();
  });

  it('should return null when primaryEmail is not a string', () => {
    const record = makeRecord({ primaryEmail: 42 });

    expect(getPrimaryEmailFromRecord(record)).toBeNull();
  });
});
