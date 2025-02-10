import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

describe('recordFromArrayWithValue', () => {
  test.each([
    { array: [], expected: {}, arg: undefined },
    {
      array: ['foo', 'bar'],
      expected: { foo: 'oui', bar: 'oui' },
      arg: 'oui',
    },
    {
      array: ['foo', 'bar'] as const,
      expected: { foo: true, bar: true },
      arg: true,
    },
  ])('.recordFromArrayWithValue($array, $arg)', ({ array, arg, expected }) => {
    const result = buildRecordFromKeysWithSameValue(array, arg);
    expect(result).toEqual(expected);
  });
});
