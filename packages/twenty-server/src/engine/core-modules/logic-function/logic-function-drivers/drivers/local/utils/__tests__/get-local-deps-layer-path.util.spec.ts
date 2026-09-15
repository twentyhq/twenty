import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';
import { getDepsLayerChecksum } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-deps-layer-checksum.util';

describe('getLocalDepsLayerPath', () => {
  it('keys the deps layer on the combined dependency checksum', () => {
    const flatApplication = {
      packageJsonChecksum: 'pkg123',
      yarnLockChecksum: 'lock123',
    } as FlatApplication;

    expect(getLocalDepsLayerPath(flatApplication)).toBe(
      `${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/deps/${getDepsLayerChecksum(
        flatApplication,
      )}`,
    );
  });

  it('does not share a layer between applications with the same yarn.lock but a different package.json', () => {
    const pathA = getLocalDepsLayerPath({
      packageJsonChecksum: 'pkg-a',
      yarnLockChecksum: 'same-lock',
    } as FlatApplication);
    const pathB = getLocalDepsLayerPath({
      packageJsonChecksum: 'pkg-b',
      yarnLockChecksum: 'same-lock',
    } as FlatApplication);

    expect(pathA).not.toBe(pathB);
  });

  it('does not collapse applications with no yarn.lock into one shared layer', () => {
    const pathA = getLocalDepsLayerPath({
      packageJsonChecksum: 'pkg-a',
      yarnLockChecksum: undefined,
    } as unknown as FlatApplication);
    const pathB = getLocalDepsLayerPath({
      packageJsonChecksum: 'pkg-b',
      yarnLockChecksum: undefined,
    } as unknown as FlatApplication);

    expect(pathA).not.toBe(pathB);
  });

  it('reuses a single layer for an identical dependency definition', () => {
    const fields = {
      packageJsonChecksum: 'pkg-x',
      yarnLockChecksum: 'lock-x',
    } as FlatApplication;

    expect(getLocalDepsLayerPath(fields)).toBe(getLocalDepsLayerPath(fields));
  });
});
