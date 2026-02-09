import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

export const addExportedConst = (
  sourceFile: SourceFile,
  name: string,
  initializer: string,
): void => {
  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{ name, initializer }],
  });
};
