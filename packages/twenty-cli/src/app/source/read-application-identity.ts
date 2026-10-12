import { readFile, stat } from 'node:fs/promises';
import { isAbsolute, relative } from 'node:path';

import { isString } from '@sniptt/guards';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { extractDefineEntity } from '@/app/source/extract-define-entity';
import { extractManifestFromFile } from '@/app/source/extract-manifest-from-file';
import { listApplicationSourceFiles } from '@/app/source/list-application-source-files';
import { type AppSourceIdentity } from '@/app/source/types/app-source-identity.type';

export const readApplicationIdentity = async ({
  appPath,
  signal,
}: {
  appPath: string;
  signal: AbortSignal;
}): Promise<AppSourceIdentity> => {
  signal.throwIfAborted();

  if (!isAbsolute(appPath) || !(await stat(appPath)).isDirectory()) {
    throw new Error('The app path must be an absolute directory path.');
  }

  const filePaths = await listApplicationSourceFiles(appPath);
  let application: AppSourceIdentity['application'] = null;

  for (const filePath of filePaths) {
    signal.throwIfAborted();

    if (
      extractDefineEntity(await readFile(filePath, 'utf8')) !==
      'defineApplication'
    ) {
      continue;
    }

    if (isDefined(application)) {
      throw new Error('The project declares more than one application.');
    }

    const { config } = await extractManifestFromFile({ appPath, filePath });

    if (
      !isString(config.universalIdentifier) ||
      !isValidUniversalIdentifier(config.universalIdentifier)
    ) {
      throw new Error(
        `Could not read the application identifier in ${relative(appPath, filePath)}.`,
      );
    }

    application = {
      universalIdentifier: config.universalIdentifier,
      displayName: isString(config.displayName) ? config.displayName : null,
    };
  }

  signal.throwIfAborted();

  return { application };
};
