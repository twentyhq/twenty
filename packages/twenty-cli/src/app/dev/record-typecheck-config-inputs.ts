import { join } from 'node:path';

import { recordWatchFile } from '@/app/dev/collect-watch-inputs';
import { resolveProjectTypeScript } from '@/app/typecheck/resolve-project-typescript';

export const recordTypecheckConfigInputs = async (appPath: string) => {
  try {
    const typescript = await resolveProjectTypeScript(appPath);
    const configPath = join(appPath, 'tsconfig.json');
    const readFile: typeof typescript.sys.readFile = (path, encoding) => {
      recordWatchFile(path);

      return typescript.sys.readFile(path, encoding);
    };
    const config = typescript.readConfigFile(configPath, readFile);

    typescript.parseJsonConfigFileContent(
      config.config ?? {},
      { ...typescript.sys, readFile },
      appPath,
      undefined,
      configPath,
    );
  } catch {}
};
