import { join } from 'path';

import ts, { createProgram } from 'typescript';
import { OUTDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/outdir-folder';

export const compileTypescript = (typescriptCode: string): string => {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowSyntheticDefaultImports: true,
    outDir: `./${OUTDIR_FOLDER}`,
    types: ['node'],
  };

  const result = ts.transpileModule(typescriptCode, {
    compilerOptions: options,
  });

  return result.outputText;
};

export const compileTypescript2 = (folderPath: string) => {
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

  createProgram([join(folderPath, 'src', 'index.ts')], options).emit();
};
