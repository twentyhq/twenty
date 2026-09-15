import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

// The dependency layer's node_modules is fully determined by BOTH the
// application's package.json and its yarn.lock. Keying the shared layer on
// yarnLockChecksum alone let two applications with different package.json
// dependencies reuse each other's layer across workspaces — most notably when
// no yarn.lock is present, where yarnLockChecksum collapses to the same value
// for every app. Combining both checksums makes the key content-addressed on
// the complete dependency definition, so a layer is only ever reused for an
// identical one.
export const getDepsLayerChecksum = (
  flatApplication: Pick<
    FlatApplication,
    'packageJsonChecksum' | 'yarnLockChecksum'
  >,
): string =>
  logicFunctionCreateHash(
    `${flatApplication.packageJsonChecksum ?? 'default'}:${flatApplication.yarnLockChecksum ?? 'default'}`,
  );
