import { RELATION_AGGREGATE_VALUES_RECORD_KEY } from '@/object-record/cache/constants/RelationAggregateValuesRecordKey';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';

describe('getRecordFromRecordNode', () => {
  it('should convert a simple record node', () => {
    const recordNode = {
      id: '123',
      __typename: 'Person',
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('should handle nested object fields', () => {
    const recordNode = {
      id: '123',
      __typename: 'Person',
      name: {
        __typename: 'FullName',
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('should handle connection fields with edges', () => {
    const recordNode = {
      id: '123',
      __typename: 'Company',
      name: 'Acme Inc',
      people: {
        edges: [
          {
            node: {
              id: '456',
              __typename: 'Person',
              name: 'John Doe',
            },
          },
          {
            node: {
              id: '789',
              __typename: 'Person',
              name: 'Jane Smith',
            },
          },
        ],
      },
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('should handle null and undefined values', () => {
    const recordNode = {
      id: '123',
      __typename: 'Person',
      name: 'John Doe',
      email: null,
      phone: undefined,
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('should handle array values', () => {
    const recordNode = {
      id: '123',
      __typename: 'Person',
      tags: ['developer', 'designer'],
      scores: [100, 200, 300],
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('should handle deeply nested structures', () => {
    const recordNode = {
      id: '123',
      __typename: 'Workspace',
      settings: {
        __typename: 'WorkspaceSettings',
        display: {
          __typename: 'DisplaySettings',
          theme: 'dark',
          layout: 'compact',
        },
      },
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('should handle mixed nested objects and connections', () => {
    const recordNode = {
      id: '123',
      __typename: 'Company',
      name: 'Acme Inc',
      address: {
        __typename: 'Address',
        city: 'New York',
        country: 'USA',
      },
      employees: {
        edges: [
          {
            node: {
              id: '456',
              __typename: 'Person',
              name: {
                __typename: 'FullName',
                firstName: 'John',
                lastName: 'Doe',
              },
            },
          },
        ],
      },
    };

    const result = getRecordFromRecordNode({ recordNode });

    expect(result).toMatchSnapshot();
  });

  it('keeps the aggregates of a connection beside its records', () => {
    const result = getRecordFromRecordNode({
      recordNode: {
        id: '123',
        __typename: 'Company',
        people: {
          __typename: 'PersonConnection',
          totalCount: 2,
          edges: [{ node: { id: '456', __typename: 'Person' } }],
        },
        opportunities: {
          __typename: 'OpportunityConnection',
          sumAmountAmountMicros: null,
          edges: [],
        },
        noteTargets: { __typename: 'NoteTargetConnection', edges: [] },
      },
    });

    expect(result.people).toEqual([{ id: '456', __typename: 'Person' }]);
    expect(result[RELATION_AGGREGATE_VALUES_RECORD_KEY]).toEqual({
      people: { totalCount: 2 },
      opportunities: { sumAmountAmountMicros: null },
    });
  });

  it('adds no aggregates when no connection selects any', () => {
    const result = getRecordFromRecordNode({
      recordNode: {
        id: '123',
        __typename: 'Company',
        people: { edges: [] },
      },
    });

    expect(result).not.toHaveProperty(RELATION_AGGREGATE_VALUES_RECORD_KEY);
  });
});
