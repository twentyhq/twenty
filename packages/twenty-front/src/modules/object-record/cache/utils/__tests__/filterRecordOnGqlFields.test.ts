import { filterRecordOnGqlFields } from '../filterRecordOnGqlFields';

describe('filterRecordOnGqlFields', () => {
  it('should filter fields based on recordGqlFields with true values', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      name: 'John',
      email: 'john@example.com',
      phone: '123-456-7890',
    };

    const recordGqlFields = {
      id: true,
      name: true,
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      name: 'John',
    });
  });

  it('should exclude fields with false values', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      name: 'John',
      email: 'john@example.com',
    };

    const recordGqlFields = {
      id: true,
      name: false,
      email: true,
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      email: 'john@example.com',
    });
  });

  it('should exclude fields with undefined values', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      name: 'John',
      email: 'john@example.com',
    };

    const recordGqlFields = {
      id: true,
      name: undefined,
      email: true,
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      email: 'john@example.com',
    });
  });

  it('should handle nested objects with nested RecordGqlFields', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      name: {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'William',
      },
      email: 'john@example.com',
    };

    const recordGqlFields = {
      id: true,
      name: {
        firstName: true,
        lastName: true,
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });
  });

  it('should handle arrays with nested RecordGqlFields', () => {
    const record = {
      id: '1',
      __typename: 'Company',
      name: 'Acme Inc',
      employees: [
        { id: '2', __typename: 'Person', name: 'John', email: 'john@test.com' },
        { id: '3', __typename: 'Person', name: 'Jane', email: 'jane@test.com' },
      ],
    };

    const recordGqlFields = {
      id: true,
      name: true,
      employees: {
        id: true,
        name: true,
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      name: 'Acme Inc',
      employees: [
        { id: '2', name: 'John' },
        { id: '3', name: 'Jane' },
      ],
    });
  });

  it('should handle null values in nested objects', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      company: null,
    };

    const recordGqlFields = {
      id: true,
      company: {
        id: true,
        name: true,
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      company: null,
    });
  });

  it('should handle undefined values in nested objects', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      company: undefined,
    };

    const recordGqlFields = {
      id: true,
      company: {
        id: true,
        name: true,
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      company: undefined,
    });
  });

  it('should handle deeply nested structures', () => {
    const record = {
      id: '1',
      __typename: 'Company',
      address: {
        city: 'New York',
        country: {
          name: 'USA',
          code: 'US',
          continent: {
            name: 'North America',
            code: 'NA',
          },
        },
      },
    };

    const recordGqlFields = {
      id: true,
      address: {
        city: true,
        country: {
          name: true,
          continent: {
            name: true,
          },
        },
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      address: {
        city: 'New York',
        country: {
          name: 'USA',
          continent: {
            name: 'North America',
          },
        },
      },
    });
  });

  it('should handle arrays with primitive values when gqlField is true', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      tags: ['tag1', 'tag2', 'tag3'],
    };

    const recordGqlFields = {
      id: true,
      tags: true,
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      tags: ['tag1', 'tag2', 'tag3'],
    });
  });

  it('should handle mixed arrays with null values', () => {
    const record = {
      id: '1',
      __typename: 'Company',
      employees: [
        { id: '2', __typename: 'Person', name: 'John' },
        null,
        { id: '3', __typename: 'Person', name: 'Jane' },
      ],
    };

    const recordGqlFields = {
      id: true,
      employees: {
        id: true,
        name: true,
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      employees: [{ id: '2', name: 'John' }, null, { id: '3', name: 'Jane' }],
    });
  });

  it('should return empty object when no fields match', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      name: 'John',
    };

    const recordGqlFields = {
      email: true,
      phone: true,
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({});
  });

  it('should not include fields that are not in recordGqlFields', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      name: 'John',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: 'NYC',
    };

    const recordGqlFields = {
      id: true,
      email: true,
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      email: 'john@example.com',
    });
  });
});
