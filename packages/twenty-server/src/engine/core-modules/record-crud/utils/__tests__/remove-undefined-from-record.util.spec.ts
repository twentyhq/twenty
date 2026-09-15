import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';

describe('removeUndefinedFromRecord', () => {
  it('should strip undefined values', () => {
    expect(removeUndefinedFromRecord({ name: 'John', age: undefined })).toEqual(
      {
        name: 'John',
      },
    );
  });

  it('should preserve null values so a field can be cleared', () => {
    expect(
      removeUndefinedFromRecord({ name: 'John', closeDate: null }),
    ).toEqual({ name: 'John', closeDate: null });
  });

  it('should preserve null sub-properties in composite fields', () => {
    expect(
      removeUndefinedFromRecord({
        emails: { primaryEmail: null, additionalEmails: undefined },
      }),
    ).toEqual({ emails: { primaryEmail: null } });
  });

  it('should drop nested objects that only contain undefined', () => {
    expect(
      removeUndefinedFromRecord({
        emails: { primaryEmail: undefined },
        name: 'John',
      }),
    ).toEqual({ name: 'John' });
  });

  it('should preserve arrays as-is', () => {
    expect(
      removeUndefinedFromRecord({ tags: ['a', 'b'], removed: undefined }),
    ).toEqual({ tags: ['a', 'b'] });
  });
});
