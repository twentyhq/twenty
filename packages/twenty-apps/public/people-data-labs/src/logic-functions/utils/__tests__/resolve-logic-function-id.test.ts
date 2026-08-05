import { describe, expect, it } from 'vitest';

import { resolveLogicFunctionId } from 'src/logic-functions/utils/resolve-logic-function-id';

describe('resolveLogicFunctionId', () => {
  const logicFunctions = [
    { id: 'id-a', universalIdentifier: 'uid-a' },
    { id: 'id-b', universalIdentifier: 'uid-b' },
  ];

  it('returns the id matching the universal identifier', () => {
    expect(
      resolveLogicFunctionId({ logicFunctions, universalIdentifier: 'uid-b' }),
    ).toBe('id-b');
  });

  it('returns undefined when no logic function matches', () => {
    expect(
      resolveLogicFunctionId({
        logicFunctions,
        universalIdentifier: 'uid-missing',
      }),
    ).toBeUndefined();
  });
});
