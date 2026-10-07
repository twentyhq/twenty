import { randomUUID } from 'node:crypto';
import { cp, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { APP_TEMPLATE_PACKAGE_VERSION } from '@/app/constants/app-template-package-version.constant';
import { APP_TEMPLATE_FIRST_PARTY_PACKAGES } from '@/app/constants/app-template-packages.constant';
import { getAppTemplateDirectory } from '@/app/get-app-template-directory';
import { printTypescriptValue } from '@/app/pull/print-typescript-value';

export const renderAppTemplate = async ({
  appDirectory,
  appName,
  appDisplayName,
  appDescription,
}: {
  appDirectory: string;
  appName: string;
  appDisplayName: string;
  appDescription: string;
}) => {
  await cp(getAppTemplateDirectory(), appDirectory, { recursive: true });

  // npm excludes these dotfiles when packing the template.
  for (const [source, destination] of [
    ['gitignore', '.gitignore'],
    ['github', '.github'],
    ['yarnrc.yml', '.yarnrc.yml'],
  ]) {
    await rename(join(appDirectory, source), join(appDirectory, destination));
  }

  await cp(join(appDirectory, 'AGENTS.md'), join(appDirectory, 'CLAUDE.md'));

  const identifiersPath = join(
    appDirectory,
    'src/constants/universal-identifiers.ts',
  );
  const identifiers = (await readFile(identifiersPath, 'utf8'))
    .replace(/'DISPLAY-NAME-TO-BE-GENERATED'/g, () =>
      printTypescriptValue({ value: appDisplayName }),
    )
    .replace(/'DESCRIPTION-TO-BE-GENERATED'/g, () =>
      printTypescriptValue({ value: appDescription }),
    )
    .replace(/UUID-TO-BE-GENERATED/g, () => randomUUID());

  await writeFile(identifiersPath, identifiers);

  const packageJsonPath = join(appDirectory, 'package.json');
  const packageJson: {
    name: string;
    engines: Record<string, string>;
    devDependencies: Record<string, string>;
  } = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  packageJson.name = appName;
  packageJson.engines.twenty = `>=${APP_TEMPLATE_PACKAGE_VERSION}`;

  for (const packageName of APP_TEMPLATE_FIRST_PARTY_PACKAGES) {
    packageJson.devDependencies[packageName] = APP_TEMPLATE_PACKAGE_VERSION;
  }

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};
