import { filterRecordOnGqlFields } from '@/object-record/cache/utils/filterRecordOnGqlFields';

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

  it('should handle composite fields with RecordGqlFields', () => {
    const record = {
      id: '1',
      __typename: 'Person',
      fullName: {
        firstName: 'John',
        lastName: 'Doe',
      },
      email: 'john@example.com',
    };

    const recordGqlFields = {
      id: true,
      fullName: {
        firstName: true,
        lastName: true,
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      fullName: {
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
      __typename: 'Person',
      company: {
        id: '2',
        taskTargets: [
          {
            id: '3',
            task: {
              id: '4',
              title: 'Task 1',
              assignee: {
                id: '6',
                name: 'Assignee 1',
              },
            },
            targetCompany: {
              id: '5',
              name: 'Company 1',
            },
          },
        ],
      },
    };

    const recordGqlFields = {
      id: true,
      company: {
        id: true,
        taskTargets: {
          id: true,
          task: {
            id: true,
            title: true,
          },
          targetCompany: {
            id: true,
            name: true,
          },
        },
      },
    };

    const result = filterRecordOnGqlFields({ record, recordGqlFields });

    expect(result).toEqual({
      id: '1',
      company: {
        id: '2',
        taskTargets: [
          {
            id: '3',
            task: {
              id: '4',
              title: 'Task 1',
            },
            targetCompany: {
              id: '5',
              name: 'Company 1',
            },
          },
        ],
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
