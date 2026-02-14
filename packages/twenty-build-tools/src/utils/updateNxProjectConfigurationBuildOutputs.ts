import * as fs from 'fs';

import { updateJsonFile } from './updateJsonFile';

export const updateNxProjectConfigurationBuildOutputs = (
  projectConfigPath: string,
  outputs: string[],
) => {
  const rawJsonFile = fs.readFileSync(projectConfigPath, 'utf-8');
  const initialJsonFile = JSON.parse(rawJsonFile);

  updateJsonFile({
    file: projectConfigPath,
    content: {
      ...initialJsonFile,
      targets: {
        ...initialJsonFile.targets,
        build: {
          ...initialJsonFile.targets.build,
          outputs,
        },
      },
    },
  });
};
