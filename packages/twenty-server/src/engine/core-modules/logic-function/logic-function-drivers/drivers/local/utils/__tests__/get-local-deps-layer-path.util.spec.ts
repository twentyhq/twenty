import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';

describe('getLocalDepsLayerPath', () => {
  it('joins the tmpdir folder, the deps segment and the yarnLockChecksum', () => {
    expect(
      getLocalDepsLayerPath({ yarnLockChecksum: 'abc123' } as FlatApplication),
    ).toBe(`${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/deps/abc123`);
  });

  it('falls back to default when yarnLockChecksum is undefined', () => {
    expect(
      getLocalDepsLayerPath({
        yarnLockChecksum: undefined,
      } as unknown as FlatApplication),
    ).toBe(`${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/deps/default`);
  });
});
