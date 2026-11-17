import { createHash } from 'node:crypto';
import { isArray, isString } from '@sniptt/guards';
import {
  ASSETS_DIR,
  isSourceFileManifestList,
  isRestorableFrontComponentSourcePath,
  type FrontComponentManifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { type AppExportFile } from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';

const isPackageJsonObject = (content: string): boolean => {
  try {
    return isPlainObject(JSON.parse(content));
  } catch {
    return false;
  }
};

export const parsePullFiles = ({
  value,
  frontComponents = [],
}: {
  value: unknown;
  frontComponents?: Pick<
    FrontComponentManifest,
    'sourceComponentPath' | 'sourceFiles'
  >[];
}): AppExportFile[] => {
  if (!isArray(value)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The exported files must be an array.',
    });
  }

  const inventory = new Map<string, string>();
  for (const component of frontComponents) {
    if (component.sourceFiles === undefined) continue;
    if (
      !isSourceFileManifestList(component.sourceFiles) ||
      !component.sourceFiles.some(
        (file) => file.filePath === component.sourceComponentPath,
      )
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message:
          'The server returned an invalid front component source inventory.',
      });
    }
    for (const file of component.sourceFiles) {
      if (
        inventory.has(file.filePath) &&
        inventory.get(file.filePath) !== file.checksum
      ) {
        throw new CliError({
          code: 'INVALID_RESPONSE',
          message: `Conflicting source checksums for ${file.filePath}.`,
        });
      }
      inventory.set(file.filePath, file.checksum);
    }
  }
  const files: AppExportFile[] = [];
  const paths = new Set<string>();

  for (const file of value) {
    if (
      !isPlainObject(file) ||
      !isString(file.folder) ||
      !isString(file.path) ||
      !isString(file.content) ||
      (file.encoding != null &&
        (file.encoding !== 'base64' || file.folder !== FileFolder.Source))
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server returned an invalid exported file.',
      });
    }

    const isFrontComponentSource =
      file.folder === FileFolder.Source &&
      (inventory.has(file.path) ||
        (frontComponents.some(
          (component) => component.sourceComponentPath === file.path,
        ) &&
          isRestorableFrontComponentSourcePath(file.path)));
    const isPublicAsset = file.folder === FileFolder.PublicAsset;

    if (
      !isPublicAsset &&
      !isFrontComponentSource &&
      (file.folder !== FileFolder.Dependencies ||
        !['package.json', 'yarn.lock'].includes(file.path))
    ) {
      throw new CliError({
        code: 'TOOLING_UNSUPPORTED',
        message:
          'This CLI can only pull dependency files, public assets and declared front component sources. No local files were changed.',
      });
    }

    if (
      isPublicAsset &&
      (!file.path.startsWith(`${ASSETS_DIR}/`) ||
        file.path.includes('\\') ||
        file.path.includes('\0') ||
        file.path.split('/').some((part) => ['', '.', '..'].includes(part)))
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: `The exported public asset ${file.path} must have a safe path under ${ASSETS_DIR}/.`,
      });
    }

    if (
      (isPublicAsset || file.encoding === 'base64') &&
      Buffer.from(file.content, 'base64').toString('base64') !== file.content
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: `The exported file ${file.path} is not valid base64.`,
      });
    }

    if (paths.has(file.path.toLowerCase())) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: `The server exported ${file.path} more than once.`,
      });
    }

    if (file.path === 'package.json' && !isPackageJsonObject(file.content)) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The exported package.json must contain a JSON object.',
      });
    }

    paths.add(file.path.toLowerCase());
    files.push({
      folder: file.folder,
      path: file.path,
      content: file.content,
      ...(file.encoding === 'base64' ? { encoding: 'base64' as const } : {}),
    });
  }

  for (const [path, checksum] of inventory) {
    const file = files.find((file) => file.path === path);
    if (
      !file ||
      (file.folder !== FileFolder.Source &&
        file.folder !== FileFolder.PublicAsset) ||
      createHash('md5')
        .update(
          Buffer.from(
            file.content,
            file.encoding === 'base64' || file.folder === FileFolder.PublicAsset
              ? 'base64'
              : 'utf8',
          ),
        )
        .digest('hex') !== checksum
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: `Source file ${path} is missing or does not match its checksum. No local files were changed.`,
      });
    }
  }
  return files;
};
