import { type EachTestingContext } from 'twenty-shared/testing';
import { getIndexNeighboursElementsFromArray } from '~/utils/array/getIndexNeighboursElementsFromArray';

type TestCase = {
  expected: ReturnType<typeof getIndexNeighboursElementsFromArray>;
} & Parameters<typeof getIndexNeighboursElementsFromArray>[0];

describe('getIndexNeighboursElementsFromArray', () => {
  const testCases: EachTestingContext<TestCase>[] = [
    {
      title:
        'should return undefined for before and first element for after when index is 0',
      context: {
        index: 0,
        array: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          before: undefined,
          after: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
        },
      },
    },
    {
      title:
        'should return last element for before and undefined for after when index is at end',
      context: {
        index: 3,
        array: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          before: 'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
          after: undefined,
        },
      },
    },
    {
      title:
        'should return last element for before and undefined for after when index is above the end',
      context: {
        index: 42,
        array: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          before: 'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
          after: undefined,
        },
      },
    },
    {
      title: 'should return correct before and after elements for middle index',
      context: {
        index: 1,
        array: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          before: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          after: 'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
        },
      },
    },
    {
      title: 'should handle empty array array',
      context: {
        index: 0,
        array: [],
        expected: {
          before: undefined,
          after: undefined,
        },
      },
    },
  ];

  it.each(testCases)('$title', ({ context }) => {
    const result = getIndexNeighboursElementsFromArray({
      index: context.index,
      array: context.array,
    });
    expect(result).toEqual(context.expected);
  });
});
