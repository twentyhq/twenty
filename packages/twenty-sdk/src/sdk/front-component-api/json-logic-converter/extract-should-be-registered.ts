import {
  type ArrowFunction,
  Node,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';

type ExtractedAction = {
  key: string;
  shouldBeRegisteredNode: ArrowFunction;
};

export const extractShouldBeRegisteredFromConfig = (
  sourceFile: SourceFile,
): ExtractedAction[] => {
  const results: ExtractedAction[] = [];

  const objectLiterals = sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectLiteralExpression,
  );

  for (const objectLiteral of objectLiterals) {
    const keyProp = objectLiteral.getProperty('key');
    const shouldBeRegisteredProp =
      objectLiteral.getProperty('shouldBeRegistered');

    if (
      !shouldBeRegisteredProp ||
      !Node.isPropertyAssignment(shouldBeRegisteredProp)
    ) {
      continue;
    }

    const initializer = shouldBeRegisteredProp.getInitializer();

    if (!initializer || !Node.isArrowFunction(initializer)) {
      continue;
    }

    let actionKey = 'unknown';

    if (keyProp && Node.isPropertyAssignment(keyProp)) {
      const keyInit = keyProp.getInitializer();

      if (keyInit) {
        actionKey = keyInit.getText();
      }
    }

    results.push({
      key: actionKey,
      shouldBeRegisteredNode: initializer,
    });
  }

  return results;
};
