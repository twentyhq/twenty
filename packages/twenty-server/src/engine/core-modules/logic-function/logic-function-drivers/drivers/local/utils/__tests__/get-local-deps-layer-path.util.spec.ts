import { dirname, join } from 'path';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';

const DEPS_FOLDER_PATH = join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'deps');

const buildFlatApplication = (
  overrides: Partial<FlatApplication>,
): FlatApplication =>
  ({
    universalIdentifier: '3f9c2d1e-6b4a-4c8e-9f1d-2a7b5c3e8d01',
    yarnLockChecksum: 'yarn-lock-checksum',
    packageJsonChecksum: 'package-json-checksum',
    ...overrides,
  }) as FlatApplication;

describe('getLocalDepsLayerPath', () => {
  it('stays a direct child of the deps folder whatever the checksum holds', () => {
    const depsLayerPath = getLocalDepsLayerPath(
      buildFlatApplication({ yarnLockChecksum: '../../../../etc' }),
    );

    expect(dirname(depsLayerPath)).toBe(DEPS_FOLDER_PATH);
  });

  it('shares one folder between applications with the same yarn.lock', () => {
    expect(getLocalDepsLayerPath(buildFlatApplication({}))).toBe(
      getLocalDepsLayerPath(
        buildFlatApplication({
          universalIdentifier: '8a1e4b7c-2d5f-4e9a-b3c6-7d0f1e2a4b59',
        }),
      ),
    );
  });

  it('changes when the yarn.lock changes', () => {
    expect(getLocalDepsLayerPath(buildFlatApplication({}))).not.toBe(
      getLocalDepsLayerPath(
        buildFlatApplication({ yarnLockChecksum: 'other-yarn-lock-checksum' }),
      ),
    );
  });

  it('ignores the package.json when there is a yarn.lock', () => {
    expect(getLocalDepsLayerPath(buildFlatApplication({}))).toBe(
      getLocalDepsLayerPath(
        buildFlatApplication({
          packageJsonChecksum: 'other-package-json-checksum',
        }),
      ),
    );
  });

  it('shares one folder between applications without a yarn.lock and with the same package.json', () => {
    const depsLayerPath = getLocalDepsLayerPath(
      buildFlatApplication({ yarnLockChecksum: null }),
    );

    expect(dirname(depsLayerPath)).toBe(DEPS_FOLDER_PATH);
    expect(depsLayerPath).toBe(
      getLocalDepsLayerPath(
        buildFlatApplication({
          universalIdentifier: '8a1e4b7c-2d5f-4e9a-b3c6-7d0f1e2a4b59',
          yarnLockChecksum: null,
        }),
      ),
    );
  });

  it('changes with the package.json when there is no yarn.lock', () => {
    expect(
      getLocalDepsLayerPath(buildFlatApplication({ yarnLockChecksum: null })),
    ).not.toBe(
      getLocalDepsLayerPath(
        buildFlatApplication({
          yarnLockChecksum: null,
          packageJsonChecksum: 'other-package-json-checksum',
        }),
      ),
    );
  });
});
