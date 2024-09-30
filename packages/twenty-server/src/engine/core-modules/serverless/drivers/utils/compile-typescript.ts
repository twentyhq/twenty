import { join } from 'path';

import ts, { createProgram } from 'typescript';

export const compileTypescript = (typescriptCode: string): string => {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowSyntheticDefaultImports: true,
    outDir: './dist',
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
    outDir: join(folderPath, 'dist', 'src'),
    types: ['node'],
  };

  createProgram([join(folderPath, 'src', 'index.ts')], options).emit();
};
