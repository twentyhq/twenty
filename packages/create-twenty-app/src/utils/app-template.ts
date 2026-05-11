import * as fs from 'fs-extra';
import { join } from 'path';
import { v4 } from 'uuid';

import createTwentyAppPackageJson from 'package.json';

const SRC_FOLDER = 'src';

export const copyBaseApplicationProject = async ({
  appName,
  appDisplayName,
  appDescription,
  appDirectory,
  onProgress,
}: {
  appName: string;
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
  onProgress?: (message: string) => void;
}) => {
  onProgress?.('Copying base template');
  await fs.copy(join(__dirname, './constants/template'), appDirectory);

  onProgress?.('Configuring dotfiles (.gitignore, .github)');
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
  await updatePackageJson({ appName, appDirectory });
};

// npm strips dotfiles/dotdirs (.gitignore, .github/) from published packages,
// so we store them without the leading dot and rename after copying.
const renameDotfiles = async ({ appDirectory }: { appDirectory: string }) => {
  const renames = [
    { from: 'gitignore', to: '.gitignore' },
    { from: 'github', to: '.github' },
  ];

  for (const { from, to } of renames) {
    const sourcePath = join(appDirectory, from);

    if (await fs.pathExists(sourcePath)) {
      await fs.rename(sourcePath, join(appDirectory, to));
    }
  }
};

// AGENTS.md is the cross-tool standard; Claude Code prefers CLAUDE.md and only
// falls back to AGENTS.md, so we mirror the file to keep a single source of truth.
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
      .replace('DISPLAY-NAME-TO-BE-GENERATED', appDisplayName)
      .replace('DESCRIPTION-TO-BE-GENERATED', appDescription)
      .replace(/UUID-TO-BE-GENERATED/g, () => v4()),
  );
};

const updatePackageJson = async ({
  appName,
  appDirectory,
}: {
  appName: string;
  appDirectory: string;
}) => {
  const packageJson = await fs.readJson(join(appDirectory, 'package.json'));

  packageJson.name = appName;
  packageJson.dependencies['twenty-sdk'] = createTwentyAppPackageJson.version;
  packageJson.dependencies['twenty-client-sdk'] =
    createTwentyAppPackageJson.version;

  await fs.writeFile(
    join(appDirectory, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8',
  );
};
