import { JsonLogicConversionError } from '@/sdk/front-component-api/json-logic-converter/types/json-logic-conversion-error';
import {
  type ArrowFunction,
  Node,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

type ExtractedAction = {
  key: string;
  shouldBeRegisteredNode: ArrowFunction;
};

const generateErrorMessage = (sourceFile: SourceFile) =>
  `Object with 'shouldBeRegistered' is missing a valid 'key' property in ${sourceFile.getFilePath()}`;

export const extractShouldBeRegisteredFromConfig = ({
  sourceFile,
}: {
  sourceFile: SourceFile;
}): ExtractedAction[] => {
  const objectLiterals = sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectLiteralExpression,
  );

  return objectLiterals.reduce<ExtractedAction[]>(
    (extractedActions, objectLiteral) => {
      const shouldBeRegisteredProp =
        objectLiteral.getProperty('shouldBeRegistered');

      if (
        !isDefined(shouldBeRegisteredProp) ||
        !Node.isPropertyAssignment(shouldBeRegisteredProp)
      ) {
        return extractedActions;
      }

      const initializer = shouldBeRegisteredProp.getInitializer();

      if (!isDefined(initializer) || !Node.isArrowFunction(initializer)) {
        return extractedActions;
      }

      const keyProp = objectLiteral.getProperty('key');

      if (!Node.isPropertyAssignment(keyProp)) {
        throw new JsonLogicConversionError(generateErrorMessage(sourceFile));
      }

      const actionKey = keyProp?.getInitializer()?.getText();

      if (!isDefined(actionKey)) {
        throw new JsonLogicConversionError(generateErrorMessage(sourceFile));
      }

      return [
        ...extractedActions,
        {
          key: actionKey,
          shouldBeRegisteredNode: initializer,
        },
      ];
    },
    [],
  );
};
