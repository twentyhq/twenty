import ts from 'typescript';

export const compileTypescript = (typescriptCode: string): string => {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowSyntheticDefaultImports: true,
    types: ['node'],
  };

  const result = ts.transpileModule(typescriptCode, {
    compilerOptions: options,
  });

  return result.outputText;
};
