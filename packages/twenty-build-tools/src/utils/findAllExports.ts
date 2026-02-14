import * as fs from 'fs';
import ts from 'typescript';

import { type FileExports } from '../types/FileExports';

import { extractExportsFromSourceFile } from './extractExportsFromSourceFile';
import { getTypeScriptFiles } from './getTypeScriptFiles';

export const findAllExports = (
  directoryPath: string,
  srcPath: string,
): FileExports => {
  const results: FileExports = [];
  const files = getTypeScriptFiles(directoryPath, srcPath);

  for (const file of files) {
    const sourceFile = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );

    const exports = extractExportsFromSourceFile(sourceFile);

    if (exports.length > 0) {
      results.push({
        file,
        exports,
      });
    }
  }

  return results;
};
