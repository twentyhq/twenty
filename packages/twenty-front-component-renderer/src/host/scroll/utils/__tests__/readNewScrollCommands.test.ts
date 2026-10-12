import { readNewScrollCommands } from '@/host/scroll/utils/readNewScrollCommands';

const SCROLL_TO_TOP_REQUEST = { method: 'scrollTo', top: 10 };

describe('readNewScrollCommands', () => {
  it.each([
    { scrollCommands: undefined },
    { scrollCommands: null },
    { scrollCommands: 'scrollTo' },
    { scrollCommands: 3 },
    { scrollCommands: { sequence: 1, request: SCROLL_TO_TOP_REQUEST } },
  ])(
    'should return no command when the scroll commands $scrollCommands are not an array',
    ({ scrollCommands }) => {
      expect(
        readNewScrollCommands({ scrollCommands, appliedSequence: 0 }),
      ).toEqual([]);
    },
  );

  it('should skip the entries that are not plain objects', () => {
    expect(
      readNewScrollCommands({
        scrollCommands: [
          null,
          undefined,
          'scrollTo',
          4,
          [5, SCROLL_TO_TOP_REQUEST],
          { sequence: 6, request: SCROLL_TO_TOP_REQUEST },
        ],
        appliedSequence: 0,
      }),
    ).toEqual([{ sequence: 6, request: SCROLL_TO_TOP_REQUEST }]);
  });

  it.each([
    { sequence: 1.5 },
    { sequence: Number.NaN },
    { sequence: Number.POSITIVE_INFINITY },
    { sequence: Number.MAX_SAFE_INTEGER + 1 },
    { sequence: '2' },
    { sequence: undefined },
  ])(
    'should skip a command whose sequence $sequence is not a safe integer',
    ({ sequence }) => {
      expect(
        readNewScrollCommands({
          scrollCommands: [{ sequence, request: SCROLL_TO_TOP_REQUEST }],
          appliedSequence: 0,
        }),
      ).toEqual([]);
    },
  );

  it('should skip the commands whose sequence is not greater than the applied sequence', () => {
    expect(
      readNewScrollCommands({
        scrollCommands: [
          { sequence: 2, request: SCROLL_TO_TOP_REQUEST },
          { sequence: 3, request: SCROLL_TO_TOP_REQUEST },
          { sequence: 4, request: SCROLL_TO_TOP_REQUEST },
        ],
        appliedSequence: 3,
      }),
    ).toEqual([{ sequence: 4, request: SCROLL_TO_TOP_REQUEST }]);
  });

  it('should skip the commands with a zero or negative sequence when nothing was applied yet', () => {
    expect(
      readNewScrollCommands({
        scrollCommands: [
          { sequence: -1, request: SCROLL_TO_TOP_REQUEST },
          { sequence: 0, request: SCROLL_TO_TOP_REQUEST },
        ],
        appliedSequence: 0,
      }),
    ).toEqual([]);
  });

  it('should return the new commands sorted by sequence', () => {
    const newScrollCommands = readNewScrollCommands({
      scrollCommands: [
        { sequence: 5, request: SCROLL_TO_TOP_REQUEST },
        { sequence: 2, request: SCROLL_TO_TOP_REQUEST },
        { sequence: 9, request: SCROLL_TO_TOP_REQUEST },
      ],
      appliedSequence: 0,
    });

    expect(newScrollCommands.map(({ sequence }) => sequence)).toEqual([
      2, 5, 9,
    ]);
  });

  it('should keep the acknowledged native edit sequence and the raw request of a command', () => {
    const request = { method: 'scrollBy', top: 'not validated here' };

    const [newScrollCommand] = readNewScrollCommands({
      scrollCommands: [
        {
          sequence: 1,
          acknowledgedNativeEditSequence: 7,
          request,
          ignoredProperty: true,
        },
      ],
      appliedSequence: 0,
    });

    expect(newScrollCommand).toStrictEqual({
      sequence: 1,
      acknowledgedNativeEditSequence: 7,
      request,
    });
    expect(newScrollCommand.request).toBe(request);
  });

  it('should keep a malformed acknowledged native edit sequence as is', () => {
    const [newScrollCommand] = readNewScrollCommands({
      scrollCommands: [
        {
          sequence: 1,
          acknowledgedNativeEditSequence: 'stale',
          request: SCROLL_TO_TOP_REQUEST,
        },
      ],
      appliedSequence: 0,
    });

    expect(newScrollCommand.acknowledgedNativeEditSequence).toBe('stale');
  });
});
