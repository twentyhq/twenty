import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from 'twenty-shared/constants';
import { EachTestingContext } from 'twenty-shared/testing';
import { relationFilterValueSchema } from '../relationFilterValueSchema';

type RelationFilterValueTestContext = EachTestingContext<{
  input: string | undefined | null;
  expected?: string[];
  shouldFail?: true;
}>;

describe('relationFilterValueSchema', () => {
  const testCases: RelationFilterValueTestContext[] = [
    {
      title: 'should accept valid UUID strings',
      context: {
        input: JSON.stringify(['123e4567-e89b-12d3-a456-426614174000']),
        expected: ['123e4567-e89b-12d3-a456-426614174000'],
      },
    },
    {
      title: 'should accept CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID',
      context: {
        input: JSON.stringify([CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID]),
        expected: [CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID],
      },
    },
    {
      title: 'should accept multiple valid values',
      context: {
        input: JSON.stringify([
          '123e4567-e89b-12d3-a456-426614174000',
          CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
          '987fcdeb-51a2-43d7-9012-345678901234',
        ]),
        expected: [
          '123e4567-e89b-12d3-a456-426614174000',
          CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
          '987fcdeb-51a2-43d7-9012-345678901234',
        ],
      },
    },
    {
      title: 'should return empty array for undefined value',
      context: {
        input: undefined,
        expected: [],
      },
    },
    {
      title: 'should return empty array for null value',
      context: {
        input: null,
        shouldFail: true,
      },
    },
    {
      title: 'should return empty array for empty string',
      context: {
        input: '',
        expected: [],
      },
    },
    {
      title: 'should return empty array for whitespace string',
      context: {
        input: '   ',
        shouldFail: true,
      },
    },
    {
      title: 'should reject invalid JSON string',
      context: {
        input: 'invalid-json',
        shouldFail: true,
      },
    },
    {
      title: 'should reject invalid UUID format',
      context: {
        input: JSON.stringify(['invalid-uuid']),
        shouldFail: true,
      },
    },
    {
      title: 'should reject non-array JSON',
      context: {
        input: JSON.stringify({ id: '123' }),
        shouldFail: true,
      },
    },
  ];

  it.each(testCases)('$title', ({ context }) => {
    const result = relationFilterValueSchema.safeParse(context.input);
    console.log(result.error);

    if (context.shouldFail) {
      expect(result.success).toBe(false);
    } else {
      expect(result.success).toBe(true);
      expect(result.data).toEqual(context.expected);
    }
  });
});
