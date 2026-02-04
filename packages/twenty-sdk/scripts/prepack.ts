import fs from 'fs-extra';
import path from 'path';
import { PACKAGES_TO_VENDOR } from '../vite.config';

export const PKG_PATH = path.resolve(process.cwd(), 'package.json');
export const BACKUP_PATH = path.resolve(
  process.cwd(),
  'package.__backup__.json',
);

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
