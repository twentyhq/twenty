import { isFailedToolOutput } from 'src/engine/core-modules/tool-provider/utils/is-failed-tool-output.util';

describe('isFailedToolOutput', () => {
  it.each([
    [
      'a tool output reporting a failure',
      { success: false, message: 'Failed to execute find_people' },
      true,
    ],
    [
      'a tool output reporting a success',
      { success: true, message: 'Found 2 people' },
      false,
    ],
    ['a factory result without a success flag', { id: 'view-id' }, false],
    ['a result that is not an object', true, false],
    ['a missing result', undefined, false],
  ])('should classify %s', (_, output, isFailed) => {
    expect(isFailedToolOutput(output)).toBe(isFailed);
  });
});
