import * as fs from 'fs';
import path from 'path';

import { type CreateTypeScriptFileArgs } from '../types/CreateTypeScriptFileArgs';

import { prettierFormat } from './prettierFormat';

const HEADER = `
/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\__, |
 *                              |___/
 */
`;

export const createTypeScriptFile = ({
  content,
  path: filePath,
  filename,
}: CreateTypeScriptFileArgs) => {
  const formattedContent = prettierFormat(
    `${HEADER}\n${content}\n`,
    'typescript',
  );

  fs.writeFileSync(
    path.join(filePath, `${filename}.ts`),
    formattedContent,
    'utf-8',
  );
};
