import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';

export const getUnsupportedFrontComponentSourceReason = ({
  source,
  universalIdentifier,
  packageNames,
}: {
  source: string;
  universalIdentifier: string;
  packageNames: ReadonlySet<string>;
}): string | undefined => {
  const sourceFile = typescript.createSourceFile(
    'component.tsx',
    source,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TSX,
  );
  const preprocessed = typescript.preProcessFile(source, true, true);
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
  let reason: string | undefined;
  const visit = (node: typescript.Node): void => {
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
        reason =
          'source uses a dynamic or local import that cannot be restored';
      }
    }
    typescript.forEachChild(node, visit);
  };
  visit(sourceFile);
  if (isDefined(reason)) return reason;

  const definition = sourceFile.statements.find(typescript.isExportAssignment);
  if (
    !isDefined(definition) ||
    !typescript.isCallExpression(definition.expression) ||
    !typescript.isIdentifier(definition.expression.expression) ||
    definition.expression.expression.text !== 'defineFrontComponent'
  ) {
    return 'source does not export a standalone defineFrontComponent definition';
  }
  const config = definition.expression.arguments[0];
  if (!isDefined(config) || !typescript.isObjectLiteralExpression(config)) {
    return 'source does not declare a literal front component identifier';
  }
  if (
    config.properties.some(
      (property) =>
        typescript.isSpreadAssignment(property) ||
        (typescript.isPropertyAssignment(property) &&
          typescript.isComputedPropertyName(property.name)),
    )
  ) {
    return 'source contains computed or spread front component metadata';
  }
  const identifiers = config.properties.filter(
    (property) =>
      typescript.isPropertyAssignment(property) &&
      (typescript.isIdentifier(property.name) ||
        typescript.isStringLiteral(property.name)) &&
      property.name.text === 'universalIdentifier',
  );
  const identifier = identifiers[0];
  if (
    identifiers.length !== 1 ||
    !isDefined(identifier) ||
    !typescript.isPropertyAssignment(identifier) ||
    !typescript.isStringLiteral(identifier.initializer) ||
    identifier.initializer.text.toLowerCase() !==
      universalIdentifier.toLowerCase()
  ) {
    return 'source does not declare the stored front component identifier';
  }
  return undefined;
};
