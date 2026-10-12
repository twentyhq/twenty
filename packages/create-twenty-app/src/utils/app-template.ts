import * as fs from 'fs-extra';
import { join } from 'path';
import { v4 } from 'uuid';

import { TEMPLATE_PACKAGE_VERSION } from '../constants/template-package-version';
import { TEMPLATE_FIRST_PARTY_PACKAGES } from '../constants/template-packages';

const SRC_FOLDER = 'src';

export const copyBaseApplicationProject = async ({
  appName,
  appDisplayName,
  appDescription,
  appDirectory,
  templateDirectory = join(__dirname, './constants/template'),
  packageVersion = TEMPLATE_PACKAGE_VERSION,
  onProgress,
}: {
  appName: string;
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
  templateDirectory?: string;
  packageVersion?: string;
  onProgress?: (message: string) => void;
}) => {
  onProgress?.('Copying base template');
  await fs.copy(templateDirectory, appDirectory);

  onProgress?.('Configuring dotfiles (.gitignore, .github, .yarnrc.yml)');
  await renameDotfiles({ appDirectory });

  onProgress?.('Mirroring AGENTS.md to CLAUDE.md');
  await mirrorAgentsToClaude({ appDirectory });

  await addEmptyPublicDirectory({ appDirectory });

  onProgress?.('Generating unique application identifiers');
  await generateUniversalIdentifiers({
    appDisplayName,
    appDescription,
    appDirectory,
  });

  onProgress?.('Updating package.json');
  await updatePackageJson({ appName, appDirectory, packageVersion });
};

// npm strips dotfiles from published packages, so they're stored without the dot and renamed after copying.
const renameDotfiles = async ({ appDirectory }: { appDirectory: string }) => {
  const renames = [
    { from: 'gitignore', to: '.gitignore' },
    { from: 'github', to: '.github' },
    { from: 'yarnrc.yml', to: '.yarnrc.yml' },
  ];

  for (const { from, to } of renames) {
    const sourcePath = join(appDirectory, from);

    if (await fs.pathExists(sourcePath)) {
      await fs.rename(sourcePath, join(appDirectory, to));
    }
  }
};

// Claude Code prefers CLAUDE.md over the AGENTS.md standard, so mirror it.
const mirrorAgentsToClaude = async ({
  appDirectory,
}: {
  appDirectory: string;
}) => {
  await fs.copy(
    join(appDirectory, 'AGENTS.md'),
    join(appDirectory, 'CLAUDE.md'),
  );
};

const addEmptyPublicDirectory = async ({
  appDirectory,
}: {
  appDirectory: string;
}) => {
  await fs.ensureDir(join(appDirectory, 'public'));
};

const generateUniversalIdentifiers = async ({
  appDisplayName,
  appDescription,
  appDirectory,
}: {
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  const universalIdentifiersPath = join(
    appDirectory,
    SRC_FOLDER,
    'constants',
    'universal-identifiers.ts',
  );

  const universalIdentifiersFileContent = await fs.readFile(
    universalIdentifiersPath,
    'utf-8',
  );

  await fs.writeFile(
    universalIdentifiersPath,
    universalIdentifiersFileContent
      .replace('DISPLAY-NAME-TO-BE-GENERATED', () =>
        escapeSingleQuotedString(appDisplayName),
      )
      .replace('DESCRIPTION-TO-BE-GENERATED', () =>
        escapeSingleQuotedString(appDescription),
      )
      .replace(/UUID-TO-BE-GENERATED/g, () => v4()),
  );
};

const escapeSingleQuotedString = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

const updatePackageJson = async ({
  appName,
  appDirectory,
  packageVersion,
}: {
  appName: string;
  appDirectory: string;
  packageVersion: string;
}) => {
  const packageJson = await fs.readJson(join(appDirectory, 'package.json'));

  // yarn.lock keeps its placeholder name: `yarn install` rewrites the root entry, and renaming here breaks `--immutable`.
  packageJson.name = appName;

  for (const packageName of TEMPLATE_FIRST_PARTY_PACKAGES) {
    packageJson.devDependencies[packageName] = packageVersion;
  }

  await fs.writeFile(
    join(appDirectory, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8',
  );
};
