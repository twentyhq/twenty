import { buildLocalChildProcessNodeFlags } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/build-local-child-process-node-flags.util';

describe('buildLocalChildProcessNodeFlags', () => {
  it('grants read access to each directory and write access to the temporary directory only', () => {
    expect(
      buildLocalChildProcessNodeFlags({
        readableDirectories: ['/execution', '/layers/deps', '/layers/sdk'],
        writableDirectory: '/execution/tmp',
        shouldAllowNetwork: false,
      }),
    ).toEqual([
      '--permission',
      '--allow-addons',
      '--disable-warning=SecurityWarning',
      '--allow-fs-read=/execution',
      '--allow-fs-read=/layers/deps',
      '--allow-fs-read=/layers/sdk',
      '--allow-fs-write=/execution/tmp',
    ]);
  });

  it('keeps network access when requested', () => {
    expect(
      buildLocalChildProcessNodeFlags({
        readableDirectories: ['/execution'],
        writableDirectory: '/execution/tmp',
        shouldAllowNetwork: true,
      }),
    ).toContain('--allow-net');
  });
});
