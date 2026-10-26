import { findCollidingKeyTuples } from 'src/database/commands/application-transfer/utils/find-colliding-key-tuples.util';

describe('findCollidingKeyTuples', () => {
  it('should report keys present on both sides once', () => {
    expect(
      findCollidingKeyTuples({
        sourceKeyTuples: [
          ['source/handler.ts'],
          ['source/handler.ts'],
          ['source/other.ts'],
        ],
        destinationKeyTuples: [['source/handler.ts'], ['source/unrelated.ts']],
      }),
    ).toEqual([['source/handler.ts']]);
  });

  it('should compare every key column', () => {
    expect(
      findCollidingKeyTuples({
        sourceKeyTuples: [['user-1', 'locale']],
        destinationKeyTuples: [['user-2', 'locale']],
      }),
    ).toEqual([]);
  });

  it('should never report a key holding a null, like a unique index', () => {
    expect(
      findCollidingKeyTuples({
        sourceKeyTuples: [[null, 'API_KEY']],
        destinationKeyTuples: [[null, 'API_KEY']],
      }),
    ).toEqual([]);
  });

  it('should treat an index on the application alone as a collision when both sides have rows', () => {
    expect(
      findCollidingKeyTuples({
        sourceKeyTuples: [[]],
        destinationKeyTuples: [[]],
      }),
    ).toEqual([[]]);
  });
});
