import * as fs from 'fs';

import { type JsonUpdate } from '../types/JsonUpdate';

import { updateJsonFile } from './updateJsonFile';

export const writeInPackageJson = (
  packageJsonPath: string,
  update: JsonUpdate,
) => {
  const rawJsonFile = fs.readFileSync(packageJsonPath, 'utf-8');
  const initialJsonFile = JSON.parse(rawJsonFile);

  updateJsonFile({
    file: packageJsonPath,
    content: {
      ...initialJsonFile,
      ...update,
    },
  });
};
