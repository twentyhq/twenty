import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';

export const getUnsupportedFrontComponentSourceReason = ({
  source,
  universalIdentifier,
  name,
  description,
  componentName,
  packageNames,
}: {
  source: string;
  universalIdentifier: string;
  name: string;
  description: string | null;
  componentName: string;
  packageNames: ReadonlySet<string>;
}): string | undefined => {
  const { diagnostics } = typescript.transpileModule(source, {
    fileName: 'component.tsx',
    compilerOptions: {
      jsx: typescript.JsxEmit.Preserve,
      target: typescript.ScriptTarget.Latest,
    },
    reportDiagnostics: true,
  });
  if (
    diagnostics?.some(
      (diagnostic) =>
        diagnostic.category === typescript.DiagnosticCategory.Error,
    )
  ) {
    return 'source contains syntax errors';
  }
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
  const reason = visit(sourceFile);
  if (isDefined(reason)) {
    return reason;
  }

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
  for (const { key, storedValue, defaultValue } of [
    { key: 'name', storedValue: name, defaultValue: componentName },
    { key: 'description', storedValue: description, defaultValue: null },
  ]) {
    const properties = config.properties.filter(
      (property) =>
        isDefined(property.name) &&
        (typescript.isIdentifier(property.name) ||
          typescript.isStringLiteral(property.name)) &&
        property.name.text === key,
    );
    const property = properties[0];
    let sourceValue = defaultValue;
    if (properties.length > 1) {
      return `source contains duplicate front component ${key}`;
    }
    if (isDefined(property)) {
      if (!typescript.isPropertyAssignment(property)) {
        return `source front component ${key} cannot be statically verified`;
      }
      const value = property.initializer;
      if (typescript.isStringLiteralLike(value)) {
        sourceValue = value.text;
      } else if (
        value.kind !== typescript.SyntaxKind.NullKeyword &&
        !(typescript.isIdentifier(value) && value.text === 'undefined')
      ) {
        return `source front component ${key} cannot be statically verified`;
      }
    }
    if (sourceValue !== storedValue) {
      return `source front component ${key} does not match stored metadata`;
    }
  }
  return undefined;
};
