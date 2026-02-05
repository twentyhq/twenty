import fs from 'fs-extra';
import { PACKAGES_TO_VENDOR } from '../vite.config';
import { BACKUP_PATH, PKG_PATH } from './constants/dependency-contants';

const stripWorkspace = (deps = {}) =>
  Object.fromEntries(
    Object.entries(deps).filter(
      ([key, _]) => !PACKAGES_TO_VENDOR.includes(key),
    ),
  );

const main = async () => {
  const pkg = await fs.readJson(PKG_PATH);

  await fs.writeJson(BACKUP_PATH, pkg, { spaces: 2 });

  const { devDependencies: _, ...builtPkg } = pkg;

  builtPkg.dependencies = stripWorkspace(builtPkg.dependencies);

  await fs.writeJson(PKG_PATH, builtPkg, { spaces: 2 });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
