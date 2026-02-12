import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';

describe('isObjectRecordConnectionWithRefs', () => {
  it('should return true for valid connection with edges', () => {
    const storeValue = {
      __typename: 'PersonConnection',
      edges: [
        {
          __typename: 'PersonEdge',
          node: {
            __ref: 'Person:123',
          },
        },
        {
          __typename: 'PersonEdge',
          node: {
            __ref: 'Person:456',
          },
        },
      ],
    };

    const result = isObjectRecordConnectionWithRefs('person', storeValue);

    expect(result).toBe(true);
  });

  it('should return true for valid connection with empty edges array', () => {
    const storeValue = {
      __typename: 'CompanyConnection',
      edges: [],
    };

    const result = isObjectRecordConnectionWithRefs('company', storeValue);

    expect(result).toBe(true);
  });

  it('should return false for connection without edges (required)', () => {
    const storeValue = {
      __typename: 'PersonConnection',
    };

    const result = isObjectRecordConnectionWithRefs('person', storeValue);

    expect(result).toBe(false);
  });

  it('should return false for incorrect __typename', () => {
    const storeValue = {
      __typename: 'WrongConnection',
      edges: [],
    };

    const result = isObjectRecordConnectionWithRefs('person', storeValue);

    expect(result).toBe(false);
  });

  it('should return false for incorrect edge __typename', () => {
    const storeValue = {
      __typename: 'PersonConnection',
      edges: [
        {
          __typename: 'WrongEdge',
          node: {
            __ref: 'Person:123',
          },
        },
      ],
    };

    const result = isObjectRecordConnectionWithRefs('person', storeValue);

    expect(result).toBe(false);
  });

  it('should return false for incorrect __ref prefix', () => {
    const storeValue = {
      __typename: 'PersonConnection',
      edges: [
        {
          __typename: 'PersonEdge',
          node: {
            __ref: 'Company:123',
          },
        },
      ],
    };

    const result = isObjectRecordConnectionWithRefs('person', storeValue);

    expect(result).toBe(false);
  });

  it('should return false for null value', () => {
    const result = isObjectRecordConnectionWithRefs('person', null);

    expect(result).toBe(false);
  });

  it('should return false for undefined value', () => {
    const result = isObjectRecordConnectionWithRefs('person', undefined);

    expect(result).toBe(false);
  });

  it('should return false for primitive value', () => {
    const result = isObjectRecordConnectionWithRefs('person', 'not an object');

    expect(result).toBe(false);
  });

  it('should handle camelCase object names', () => {
    const storeValue = {
      __typename: 'CalendarEventConnection',
      edges: [
        {
          __typename: 'CalendarEventEdge',
          node: {
            __ref: 'CalendarEvent:123',
          },
        },
      ],
    };

    const result = isObjectRecordConnectionWithRefs(
      'calendarEvent',
      storeValue,
    );

    expect(result).toBe(true);
  });

  it('should return false when node is missing __ref', () => {
    const storeValue = {
      __typename: 'PersonConnection',
      edges: [
        {
          __typename: 'PersonEdge',
          node: {
            id: '123',
          },
        },
      ],
    };

    const result = isObjectRecordConnectionWithRefs('person', storeValue);

    expect(result).toBe(false);
  });
});
