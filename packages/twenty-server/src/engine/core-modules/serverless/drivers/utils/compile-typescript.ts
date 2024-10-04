import { join } from 'path';

import ts, { createProgram } from 'typescript';

import { OUTDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/outdir-folder';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';

export const compileTypescript = (folderPath: string) => {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowSyntheticDefaultImports: true,
    outDir: join(folderPath, OUTDIR_FOLDER, 'src'),
    types: ['node'],
  };

  createProgram([join(folderPath, 'src', INDEX_FILE_NAME)], options).emit();
};
