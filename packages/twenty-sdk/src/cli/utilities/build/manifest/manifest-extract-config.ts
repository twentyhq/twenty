import * as ts from 'typescript';

export enum TargetFunction {
  DefineApplication = 'defineApplication',
  DefineField = 'defineField',
  DefineLogicFunction = 'defineLogicFunction',
  DefineObject = 'defineObject',
  DefineRole = 'defineRole',
  DefineFrontComponent = 'defineFrontComponent',
}

export enum ManifestEntityKey {
  Application = 'application',
  Fields = 'fields',
  LogicFunctions = 'logicFunctions',
  Objects = 'objects',
  Roles = 'roles',
  FrontComponents = 'frontComponents',
  PublicAssets = 'publicAssets',
}

export type EntityFilePaths = Record<ManifestEntityKey, string[]>;

export const TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING: Record<
  TargetFunction,
  ManifestEntityKey
> = {
  [TargetFunction.DefineApplication]: ManifestEntityKey.Application,
  [TargetFunction.DefineField]: ManifestEntityKey.Fields,
  [TargetFunction.DefineLogicFunction]: ManifestEntityKey.LogicFunctions,
  [TargetFunction.DefineObject]: ManifestEntityKey.Objects,
  [TargetFunction.DefineRole]: ManifestEntityKey.Roles,
  [TargetFunction.DefineFrontComponent]: ManifestEntityKey.FrontComponents,
};

const computeIsTargetFunctionCall = (node: ts.Node): string | undefined => {
  if (!ts.isCallExpression(node)) {
    return undefined;
  }

  const expression = node.expression;
  if (ts.isIdentifier(expression)) {
    if ((Object.values(TargetFunction) as string[]).includes(expression.text)) {
      return expression.text;
    }
  }

  return undefined;
};

export const extractDefineEntity = (
  fileContent: string,
): TargetFunction | undefined => {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );

  const children: ts.Node[] = [];

  ts.forEachChild(sourceFile, (node) => {
    children.push(node);
  });

  for (const node of children) {
    if (ts.isExportAssignment(node)) {
      if (node.isExportEquals || !node.expression) {
        return;
      }

      const targetFunction = computeIsTargetFunctionCall(node.expression);

      if (targetFunction) {
        return targetFunction as TargetFunction;
      }
    }
  }

  return;
};
