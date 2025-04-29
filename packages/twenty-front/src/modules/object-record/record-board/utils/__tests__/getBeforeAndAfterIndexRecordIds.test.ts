import { EachTestingContext } from 'twenty-shared/testing';
import { getBeforeAndAfterIndexRecordIds } from '../getBeforeAndAfterIndexRecordIds';

type TestCase = {
  expected: ReturnType<typeof getBeforeAndAfterIndexRecordIds>;
} & Parameters<typeof getBeforeAndAfterIndexRecordIds>[0];

describe('getBeforeAndAfterIndexRecordIds', () => {
  const testCases: EachTestingContext<TestCase>[] = [
    {
      title:
        'should return undefined for before and first record for after when draggedRecordIndex is 0',
      context: {
        draggedRecordIndex: 0,
        otherRecordIds: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          recordBeforeId: undefined,
          recordAfterId: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
        },
      },
    },
    {
      title:
        'should return last record for before and undefined for after when draggedRecordIndex is at end',
      context: {
        draggedRecordIndex: 3,
        otherRecordIds: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          recordBeforeId: 'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
          recordAfterId: undefined,
        },
      },
    },
    {
      title:
        'should return last record for before and undefined for after when draggedRecordIndex is above the end',
      context: {
        draggedRecordIndex: 42,
        otherRecordIds: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          recordBeforeId: 'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
          recordAfterId: undefined,
        },
      },
    },
    {
      title:
        'should return correct before and after records for middle draggedRecordIndex',
      context: {
        draggedRecordIndex: 1,
        otherRecordIds: [
          'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
          'c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f',
        ],
        expected: {
          recordBeforeId: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
          recordAfterId: 'b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e',
        },
      },
    },
    {
      title: 'should handle empty otherRecordIds array',
      context: {
        draggedRecordIndex: 0,
        otherRecordIds: [],
        expected: {
          recordBeforeId: undefined,
          recordAfterId: undefined,
        },
      },
    },
  ];

  it.each(testCases)('$title', ({ context }) => {
    const result = getBeforeAndAfterIndexRecordIds({
      draggedRecordIndex: context.draggedRecordIndex,
      otherRecordIds: context.otherRecordIds,
    });
    expect(result).toEqual(context.expected);
  });
});
