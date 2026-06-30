import { CONDITIONAL_AVAILABILITY_VARIABLE_NAMES } from '@/sdk/define/conditional-availability/conditional-availability-variable-names';
import { isDefined } from 'twenty-shared/utils';
import ts from 'typescript';

const CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY =
  'conditionalAvailabilityExpression';

const EXPRESSION_VARIABLE_MODULE_SPECIFIERS = ['twenty-sdk/define', 'twenty-sdk'];

const EXPRESSION_VARIABLE_NAMES = new Set<string>(
  CONDITIONAL_AVAILABILITY_VARIABLE_NAMES,
);

type ImportedExpressionVariable = {
  importedName: string;
  node: ts.Node;
};

const collectImportedExpressionVariables = (
  sourceFile: ts.SourceFile,
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
      const namespaceName = namedBindings.name.text;

      const collectNamespaceMemberUsages = (node: ts.Node): void => {
        if (
          ts.isPropertyAccessExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === namespaceName &&
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
        imported.push({ importedName, node: element });
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

  const importedExpressionVariables =
    collectImportedExpressionVariables(sourceFile);

  if (importedExpressionVariables.length === 0) {
    return [];
  }

  if (hasConditionalAvailabilityExpressionProperty(sourceFile)) {
    return [];
  }

  return importedExpressionVariables.map(({ importedName, node }) => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile),
    );

    return `${relativePath}:${line + 1}:${character + 1} - "${importedName}" is a conditional-availability expression variable from twenty-sdk but this file has no ${CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY}. These variables can only be used inside a command's ${CONDITIONAL_AVAILABILITY_EXPRESSION_PROPERTY}, not at runtime.`;
  });
};
