import { buildReleaseScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-release-script-arguments.util';

describe('buildReleaseScriptArguments', () => {
  it('consumes the released amounts as negative amounts that never warm', () => {
    expect(buildReleaseScriptArguments([3, 1_024])).toEqual([
      '[-3,-1024]',
      '[false,false]',
      '[false,false]',
    ]);
  });
});
