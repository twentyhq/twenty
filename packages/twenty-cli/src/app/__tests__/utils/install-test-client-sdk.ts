import { cp, mkdir, readFile, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectory = fileURLToPath(
  new URL('../../../../../twenty-client-sdk/', import.meta.url),
);
const repositoryModules = fileURLToPath(
  new URL('../../../../../../node_modules/', import.meta.url),
);

export const installTestClientSdk = async (packageRoot: string) => {
  await mkdir(packageRoot, { recursive: true });
  await cp(
    join(sourceDirectory, 'package.json'),
    join(packageRoot, 'package.json'),
  );
  await cp(join(sourceDirectory, 'dist'), join(packageRoot, 'dist'), {
    recursive: true,
  });
  const packageJson = JSON.parse(
    await readFile(join(sourceDirectory, 'package.json'), 'utf8'),
  );
  for (const name of Object.keys(packageJson.dependencies)) {
    const target = join(packageRoot, 'node_modules', name);
    await mkdir(join(target, '..'), { recursive: true });
    await symlink(join(repositoryModules, name), target);
  }
};
