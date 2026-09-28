import ts from 'typescript';

export const checkStoryPresentation = ({
  content,
  exportName,
}: {
  content: string;
  exportName: string;
}): string[] => {
  const source = ts.createSourceFile(
    'preview.stories.tsx',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const declarations = new Map<string, ts.Expression>();
  const errors = new Set<string>();
  const visited = new Set<ts.Node>();
  let meta: ts.Expression | undefined;

  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          declarations.set(declaration.name.text, declaration.initializer);
        }
      }
    }

    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      meta = statement.expression;
    }
  }

  const inspect = (expression: ts.Expression): void => {
    if (visited.has(expression)) {
      return;
    }

    visited.add(expression);

    if (
      ts.isAsExpression(expression) ||
      ts.isSatisfiesExpression(expression) ||
      ts.isParenthesizedExpression(expression)
    ) {
      inspect(expression.expression);
      return;
    }

    if (ts.isIdentifier(expression)) {
      const initializer = declarations.get(expression.text);

      if (!initializer) {
        errors.add(
          `Cannot verify the imported or unresolved story definition "${expression.text}".`,
        );
        return;
      }

      for (const statement of source.statements) {
        if (
          !ts.isExpressionStatement(statement) ||
          !ts.isBinaryExpression(statement.expression)
        ) {
          continue;
        }

        const { left } = statement.expression;
        const assignsPlay =
          ts.isPropertyAccessExpression(left) &&
          left.expression.getText(source) === expression.text &&
          left.name.text === 'play';

        if (assignsPlay) {
          errors.add(
            'Documentation stories must not define or inherit a play function.',
          );
        }
      }

      inspect(initializer);
      return;
    }

    if (!ts.isObjectLiteralExpression(expression)) {
      errors.add(
        'Documentation stories must use statically verifiable object definitions.',
      );
      return;
    }

    for (const property of expression.properties) {
      if (ts.isSpreadAssignment(property)) {
        inspect(property.expression);
        continue;
      }

      if (ts.isComputedPropertyName(property.name)) {
        errors.add('Cannot verify computed story properties.');
        continue;
      }

      const propertyName =
        ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
          ? property.name.text
          : property.name.getText(source);

      if (propertyName === 'play') {
        errors.add(
          'Documentation stories must not define or inherit a play function.',
        );
      }
    }
  };

  if (meta) {
    inspect(meta);
  }

  const story = declarations.get(exportName);

  if (!story) {
    errors.add(`Cannot resolve the documentation story "${exportName}".`);
    return [...errors];
  }

  inspect(ts.factory.createIdentifier(exportName));

  return [...errors];
};
