import { CONDITIONAL_AVAILABILITY_VARIABLE_NAMES } from '@/app/manifest/utils/conditional-availability-variable-names';
import { isDefined } from 'twenty-shared/utils';
import ts from 'typescript';

const CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY =
  'conditionalAvailabilityExpression';

const EXPRESSION_VARIABLE_MODULE_SPECIFIERS = [
  'twenty-sdk/define',
  'twenty-sdk',
];

const EXPRESSION_VARIABLE_NAMES = new Set<string>(
  CONDITIONAL_AVAILABILITY_VARIABLE_NAMES,
);

type ImportedExpressionVariable = {
  importedName: string;
  node: ts.Node;
};

const collectImportedExpressionVariables = (
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
): ImportedExpressionVariable[] => {
  const imported: ImportedExpressionVariable[] = [];

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !EXPRESSION_VARIABLE_MODULE_SPECIFIERS.includes(
        statement.moduleSpecifier.text,
      )
    ) {
      continue;
    }

    const importClause = statement.importClause;

    if (
      !isDefined(importClause) ||
      importClause.phaseModifier === ts.SyntaxKind.TypeKeyword
    ) {
      continue;
    }

    const namedBindings = importClause.namedBindings;

    if (!isDefined(namedBindings)) {
      continue;
    }

    if (ts.isNamespaceImport(namedBindings)) {
      const namespaceSymbol = checker.getSymbolAtLocation(namedBindings.name);

      const collectNamespaceMemberUsages = (node: ts.Node): void => {
        if (ts.isImportDeclaration(node) || ts.isTypeNode(node)) return;
        if (
          ts.isPropertyAccessExpression(node) &&
          ts.isIdentifier(node.expression) &&
          checker.getSymbolAtLocation(node.expression) === namespaceSymbol &&
          EXPRESSION_VARIABLE_NAMES.has(node.name.text)
        ) {
          imported.push({ importedName: node.name.text, node });
        }

        ts.forEachChild(node, collectNamespaceMemberUsages);
      };

      collectNamespaceMemberUsages(sourceFile);
      continue;
    }

    if (!ts.isNamedImports(namedBindings)) {
      continue;
    }

    for (const element of namedBindings.elements) {
      if (element.isTypeOnly) {
        continue;
      }

      const importedName = (element.propertyName ?? element.name).text;

      if (EXPRESSION_VARIABLE_NAMES.has(importedName)) {
        const importedSymbol = checker.getSymbolAtLocation(element.name);
        let usage: ts.Node | undefined;
        const findUsage = (node: ts.Node): void => {
          if (
            isDefined(usage) ||
            ts.isImportDeclaration(node) ||
            ts.isTypeNode(node)
          )
            return;

          if (ts.isIdentifier(node)) {
            const symbol = ts.isShorthandPropertyAssignment(node.parent)
              ? checker.getShorthandAssignmentValueSymbol(node.parent)
              : checker.getSymbolAtLocation(node);

            if (isDefined(importedSymbol) && symbol === importedSymbol)
              usage = node;
          }
          ts.forEachChild(node, findUsage);
        };

        findUsage(sourceFile);
        if (isDefined(usage)) imported.push({ importedName, node: usage });
      }
    }
  }

  return imported;
};

const hasConditionalAvailabilityExpressionProperty = (
  sourceFile: ts.SourceFile,
): boolean => {
  let found = false;

  const findExpressionProperty = (node: ts.Node): void => {
    if (found) {
      return;
    }

    if (
      (ts.isPropertyAssignment(node) ||
        ts.isShorthandPropertyAssignment(node)) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      node.name.text === CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY
    ) {
      found = true;
      return;
    }

    ts.forEachChild(node, findExpressionProperty);
  };

  findExpressionProperty(sourceFile);

  return found;
};

export const validateConditionalAvailabilityUsage = (
  fileContent: string,
  relativePath: string,
): string[] => {
  if (
    !CONDITIONAL_AVAILABILITY_VARIABLE_NAMES.some((name) =>
      fileContent.includes(name),
    )
  ) {
    return [];
  }

  const sourceFile = ts.createSourceFile(
    relativePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    relativePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  if (hasConditionalAvailabilityExpressionProperty(sourceFile)) {
    return [];
  }

  const options: ts.CompilerOptions = { noLib: true, noResolve: true };
  const host = ts.createCompilerHost(options);

  host.getSourceFile = (name) =>
    name === sourceFile.fileName ? sourceFile : undefined;
  const checker = ts
    .createProgram([sourceFile.fileName], options, host)
    .getTypeChecker();
  const importedExpressionVariables = collectImportedExpressionVariables(
    sourceFile,
    checker,
  );

  return importedExpressionVariables.map(({ importedName, node }) => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile),
    );

    return `${relativePath}:${line + 1}:${character + 1} - "${importedName}" is a conditional-availability expression variable from twenty-sdk but this file has no ${CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY}. These variables can only be used inside a command's ${CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY}, not at runtime.`;
  });
};
