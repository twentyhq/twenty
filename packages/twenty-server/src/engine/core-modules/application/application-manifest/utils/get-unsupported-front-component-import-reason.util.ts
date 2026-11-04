import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';

export const getUnsupportedFrontComponentImportReason = ({
  sourceFile,
  packageNames,
}: {
  sourceFile: typescript.SourceFile;
  packageNames: ReadonlySet<string>;
}): string | undefined => {
  const preprocessed = typescript.preProcessFile(sourceFile.text, true, true);
  if (
    preprocessed.referencedFiles.length > 0 ||
    preprocessed.typeReferenceDirectives.some(
      ({ fileName }) => fileName.startsWith('.') || fileName.startsWith('/'),
    )
  ) {
    return 'source references local files that are not exported yet';
  }
  const isPackageImport = (specifier: string) => {
    const packageName = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0];
    return (
      packageNames.has(packageName) &&
      !specifier.includes('\\') &&
      !specifier.split('/').some((part) => ['..', '.', ''].includes(part))
    );
  };
  for (const { fileName } of preprocessed.importedFiles) {
    if (!isPackageImport(fileName)) {
      return `source import "${fileName}" is not a declared package; local imports are not exported yet`;
    }
  }
  const visit = (node: typescript.Node): string | undefined => {
    if (
      typescript.isCallExpression(node) &&
      (node.expression.kind === typescript.SyntaxKind.ImportKeyword ||
        (typescript.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      const specifier = node.arguments[0];
      if (
        !isDefined(specifier) ||
        !typescript.isStringLiteralLike(specifier) ||
        !isPackageImport(specifier.text)
      ) {
        return 'source uses a dynamic or local import that cannot be restored';
      }
    }
    return typescript.forEachChild(node, visit);
  };
  return visit(sourceFile);
};
