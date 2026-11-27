import { type Metafile } from 'esbuild';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { collectApplicationSourceFiles } from '@/app/bundles/collect-application-source-files';

export const collectEntrySourcePaths = ({
  appPath,
  entryPaths,
  build,
  additionalInputs = new Map<string, string[]>(),
}: {
  appPath: string;
  entryPaths: string[];
  build: Metafile | undefined;
  additionalInputs?: Map<string, string[]>;
}): Map<string, string[]> => {
  const sourcePaths = new Map<string, string[]>();
  for (const output of Object.values(build?.outputs ?? {})) {
    if (!isDefined(output.entryPoint)) {
      continue;
    }
    const entryPath = resolve(output.entryPoint);
    const sourcePath = entryPaths.find(
      (path) => realpathSync(resolve(appPath, path)) === entryPath,
    );
    if (!isDefined(sourcePath)) {
      continue;
    }
    const inputs = Object.keys(output.inputs).map((path) => resolve(path));
    sourcePaths.set(
      sourcePath,
      collectApplicationSourceFiles({
        appPath,
        entryPaths: [sourcePath],
        buildInputs: [
          ...inputs,
          ...inputs.flatMap((path) => additionalInputs.get(path) ?? []),
        ],
      }),
    );
  }
  return sourcePaths;
};
