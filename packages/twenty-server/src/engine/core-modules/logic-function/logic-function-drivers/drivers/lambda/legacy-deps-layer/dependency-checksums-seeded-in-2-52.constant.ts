// Only for the current release (2.53): Workspace apps on the files 2.52 gave
// them also share a layer. The 2.52 upgrade wrote a snapshot frozen before the
// body-parser, nodemailer and twenty-ui bumps, while Workspace apps created on
// 2.52 got the bumped defaults, so the two sets have different checksums
export const DEPENDENCY_CHECKSUMS_SEEDED_IN_2_52 = {
  upgradeSnapshot: {
    packageJsonChecksum: '7d84e53bcbc345d9652b048470f59695',
    yarnLockChecksum: '6a09947c24d8cba9011da22936fe3e87',
  },
  defaults: {
    packageJsonChecksum: '444fb064df1febd5f30c8bcadf58e536',
    yarnLockChecksum: '225201a4fd2b60ab92c865fce0fd18d6',
  },
};
