import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import { PACKAGES_TO_VENDOR } from '../vite.config';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, '../package.json');
const distDir = path.resolve(__dirname, '../dist');

const main = async () => {
  const pkg = await fs.readJson(pkgPath);

  const stripWorkspaceRanges = (deps = {}) =>
    Object.fromEntries(
      Object.entries(deps).filter(
        ([key, _]) => !PACKAGES_TO_VENDOR.includes(key),
      ),
    );

  const outPkg = {
    name: pkg.name,
    version: pkg.version,
    license: pkg.license,
    description: pkg.description,
    keywords: pkg.keywords,
    repository: pkg.repository,
    homepage: pkg.homepage,
    bugs: pkg.bugs,
    author: pkg.author,

    main: pkg.main,
    module: pkg.module,
    types: pkg.types,
    bin: pkg.bin,
    exports: pkg.exports,
    typesVersions: pkg.typesVersions,
    engines: pkg.engines,

    dependencies: stripWorkspaceRanges(pkg.dependencies),
  };

  await fs.ensureDir(distDir);
  await fs.writeJson(path.join(distDir, 'package.json'), outPkg, {
    spaces: 2,
  });

  // Optional but common: include README/LICENSE in the published tarball
  for (const file of ['README.md', 'LICENSE']) {
    const src = path.resolve(__dirname, '..', file);
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(distDir, file));
    }
  }
};

main();
