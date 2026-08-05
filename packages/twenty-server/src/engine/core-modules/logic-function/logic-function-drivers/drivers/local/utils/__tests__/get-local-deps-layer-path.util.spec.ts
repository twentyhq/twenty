import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';

describe('getLocalDepsLayerPath', () => {
  it('joins the tmpdir folder, the deps segment and the yarnLockChecksum', () => {
    expect(
      getLocalDepsLayerPath({ yarnLockChecksum: 'abc123' } as FlatApplication),
    ).toBe(`${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/deps/abc123`);
  });

  it('falls back to the packageJsonChecksum when yarnLockChecksum is undefined', () => {
    expect(
      getLocalDepsLayerPath({
        yarnLockChecksum: undefined,
        packageJsonChecksum: 'pkg456',
      } as unknown as FlatApplication),
    ).toBe(`${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/deps/pkg456`);
  });

  it('falls back to the application id when both checksums are missing', () => {
    expect(
      getLocalDepsLayerPath({
        id: 'app-id-1',
        yarnLockChecksum: undefined,
        packageJsonChecksum: undefined,
      } as unknown as FlatApplication),
    ).toBe(`${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/deps/app-id-1`);
  });
});
