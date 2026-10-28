// Only for the current release (2.54): Workspace apps still on the files 2.52
// or 2.53 gave them also share a layer. The 2.52 upgrade wrote a snapshot
// frozen before the body-parser, nodemailer and twenty-ui bumps, and the
// defaults changed again in 2.53, so each set has its own checksums
export const DEPENDENCY_CHECKSUMS_SEEDED_BEFORE_2_54 = {
  v2_52UpgradeSnapshot: {
    packageJsonChecksum: '7d84e53bcbc345d9652b048470f59695',
    yarnLockChecksum: '6a09947c24d8cba9011da22936fe3e87',
  },
  v2_52Defaults: {
    packageJsonChecksum: '444fb064df1febd5f30c8bcadf58e536',
    yarnLockChecksum: '225201a4fd2b60ab92c865fce0fd18d6',
  },
  v2_53Defaults: {
    packageJsonChecksum: '444fb064df1febd5f30c8bcadf58e536',
    yarnLockChecksum: '5ed70f81bf547755d85b6dd28614a42a',
  },
};
