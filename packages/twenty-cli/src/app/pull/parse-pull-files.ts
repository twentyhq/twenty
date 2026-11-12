import { isArray, isString } from '@sniptt/guards';
import {
  ASSETS_DIR,
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
  publicAssets = [],
}: {
  value: unknown;
  frontComponents?: Pick<FrontComponentManifest, 'sourceComponentPath'>[];
  publicAssets?: unknown;
}): AppExportFile[] => {
  if (!isArray(value)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The exported files must be an array.',
    });
  }

  const files: AppExportFile[] = [];
  const paths = new Set<string>();

  for (const file of value) {
    if (
      !isPlainObject(file) ||
      !isString(file.folder) ||
      !isString(file.path) ||
      !isString(file.content)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server returned an invalid exported file.',
      });
    }

    const isFrontComponentSource =
      file.folder === FileFolder.Source &&
      frontComponents.some(
        (component) => component.sourceComponentPath === file.path,
      ) &&
      isRestorableFrontComponentSourcePath(file.path);
    const isPublicAsset =
      file.folder === FileFolder.PublicAsset &&
      file.path.startsWith(`${ASSETS_DIR}/`) &&
      !file.path.includes('\\') &&
      !file.path.includes('\0') &&
      file.path.split('/').every((part) => !['', '.', '..'].includes(part)) &&
      isArray(publicAssets) &&
      publicAssets.some(
        (asset) => isPlainObject(asset) && asset.filePath === file.path,
      );

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
      Buffer.from(file.content, 'base64').toString('base64') !== file.content
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: `The exported public asset ${file.path} is not valid base64.`,
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
    files.push({ folder: file.folder, path: file.path, content: file.content });
  }

  return files;
};
