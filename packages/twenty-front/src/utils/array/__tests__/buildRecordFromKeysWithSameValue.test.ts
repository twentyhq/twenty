import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';
import { type EachTestingContext } from 'twenty-shared/testing';

type BuildRecordFromKeysWithSameValueTestContext = EachTestingContext<{
  array: string[];
  expected: Record<string, boolean | string>;
  arg?: boolean | string;
}>;

const buildRecordFromKeysWithSameValueTestUseCases: BuildRecordFromKeysWithSameValueTestContext[] =
  [
    {
      title: 'It should create record from array and fill with boolean',
      context: {
        array: ['foo', 'bar'] as const,
        expected: { foo: true, bar: true },
        arg: true,
      },
    },
    {
      title: 'It should create record from array and fill with string',
      context: {
        array: ['foo', 'bar'],
        expected: { foo: 'oui', bar: 'oui' },
        arg: 'oui',
      },
    },
    {
      title: 'It should create empty record from empty array',
      context: { array: [], expected: {}, arg: undefined },
    },
  ];
describe('buildRecordFromKeysWithSameValue', () => {
  test.each<BuildRecordFromKeysWithSameValueTestContext>(
    buildRecordFromKeysWithSameValueTestUseCases,
  )('.$title', ({ context: { array, arg, expected } }) => {
    const result = buildRecordFromKeysWithSameValue(array, arg);
    expect(result).toEqual(expected);
  });
});
