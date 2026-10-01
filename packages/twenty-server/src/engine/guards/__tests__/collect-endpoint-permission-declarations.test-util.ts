import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

import { isDefined } from 'twenty-shared/utils';
import * as ts from 'typescript';

type DeclaredValue = boolean | string | DeclaredObject;

type DeclaredObject = { [key: string]: DeclaredValue };

type EndpointPermissionDeclarations = Partial<
  Record<'authPrincipalGuard' | 'applicationTarget', DeclaredObject>
>;

type EndpointPermissionDeclarationsByFilePath = Record<
  string,
  Record<string, EndpointPermissionDeclarations>
>;

const PACKAGE_ROOT_PATH = join(__dirname, '../../../..');
const SOURCE_ROOT_PATH = join(PACKAGE_ROOT_PATH, 'src');

const AUTH_PRINCIPAL_GUARD = 'AuthPrincipalGuard';

const NAME_ARGUMENTS_BY_APPLICATION_TARGET_DECORATOR = new Map<
  string,
  string[]
>([
  ['ApplicationTargetArg', ['argName']],
  ['ApplicationTargetArgs', []],
  ['ApplicationTargetParam', ['paramName']],
]);

const isScannedSourceFilePath = (filePath: string): boolean =>
  filePath.endsWith('.ts') &&
  !filePath.endsWith('.spec.ts') &&
  !filePath.endsWith('.integration-spec.ts') &&
  !filePath.includes('__tests__');

const formatLocation = (node: ts.Node): string => {
  const sourceFile = node.getSourceFile();
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

  return `${relative(PACKAGE_ROOT_PATH, sourceFile.fileName)}:${line + 1}`;
};

const throwNotInlineLiteral = (node: ts.Node): never => {
  throw new Error(
    `${formatLocation(node)}: ${node.getText()} must be an inline literal so the endpoint permission snapshot records its value`,
  );
};

const readInlineObjectLiteral = (node: ts.Expression): DeclaredObject => {
  if (!ts.isObjectLiteralExpression(node)) {
    return throwNotInlineLiteral(node);
  }

  return Object.fromEntries(
    node.properties.map((property) => {
      if (
        !ts.isPropertyAssignment(property) ||
        !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
      ) {
        return throwNotInlineLiteral(property);
      }

      return [property.name.text, readInlineLiteral(property.initializer)];
    }),
  );
};

const readInlineLiteral = (node: ts.Expression): DeclaredValue => {
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (ts.isStringLiteralLike(node)) {
    return node.text;
  }

  return readInlineObjectLiteral(node);
};

const getDecoratedEndpointName = (decorator: ts.Decorator): string => {
  const decoratedNode = ts.isParameter(decorator.parent)
    ? decorator.parent.parent
    : decorator.parent;

  if (ts.isClassDeclaration(decoratedNode) && isDefined(decoratedNode.name)) {
    return decoratedNode.name.text;
  }

  if (
    ts.isMethodDeclaration(decoratedNode) &&
    ts.isClassDeclaration(decoratedNode.parent) &&
    isDefined(decoratedNode.parent.name)
  ) {
    return `${decoratedNode.parent.name.text}.${decoratedNode.name.getText()}`;
  }

  throw new Error(
    `${formatLocation(decorator)}: the endpoint permission snapshot only records declarations on a named class or one of its methods`,
  );
};

const addDeclaration = ({
  declarationsByFilePath,
  node,
  endpointName,
  declarationKind,
  declaration,
}: {
  declarationsByFilePath: EndpointPermissionDeclarationsByFilePath;
  node: ts.Node;
  endpointName: string;
  declarationKind: keyof EndpointPermissionDeclarations;
  declaration: DeclaredObject;
}): void => {
  const filePath = relative(PACKAGE_ROOT_PATH, node.getSourceFile().fileName);
  const declarationsByEndpointName = (declarationsByFilePath[filePath] ??= {});
  const endpointDeclarations = (declarationsByEndpointName[endpointName] ??=
    {});

  if (isDefined(endpointDeclarations[declarationKind])) {
    throw new Error(
      `${formatLocation(node)}: ${endpointName} declares more than one ${declarationKind}`,
    );
  }

  endpointDeclarations[declarationKind] = declaration;
};

const collectAuthPrincipalGuard = (
  declarationsByFilePath: EndpointPermissionDeclarationsByFilePath,
  callExpression: ts.CallExpression,
): void => {
  const decorator = ts.findAncestor(callExpression, ts.isDecorator);

  if (!isDefined(decorator)) {
    throw new Error(
      `${formatLocation(callExpression)}: ${AUTH_PRINCIPAL_GUARD} must be invoked inside a decorator so the endpoint permission snapshot attributes it to an endpoint`,
    );
  }

  addDeclaration({
    declarationsByFilePath,
    node: callExpression,
    endpointName: getDecoratedEndpointName(decorator),
    declarationKind: 'authPrincipalGuard',
    declaration: readInlineObjectLiteral(callExpression.arguments[0]),
  });
};

const collectApplicationTarget = (
  declarationsByFilePath: EndpointPermissionDeclarationsByFilePath,
  callExpression: ts.CallExpression,
  decoratorName: string,
  nameArgumentNames: string[],
): void => {
  if (!ts.isDecorator(callExpression.parent)) {
    throw new Error(
      `${formatLocation(callExpression)}: ${decoratorName} must be applied as a parameter decorator`,
    );
  }

  addDeclaration({
    declarationsByFilePath,
    node: callExpression,
    endpointName: getDecoratedEndpointName(callExpression.parent),
    declarationKind: 'applicationTarget',
    declaration: {
      decorator: decoratorName,
      ...Object.fromEntries(
        nameArgumentNames.map((argumentName, argumentIndex) => [
          argumentName,
          readInlineLiteral(callExpression.arguments[argumentIndex]),
        ]),
      ),
      ...readInlineObjectLiteral(
        callExpression.arguments[nameArgumentNames.length],
      ),
    },
  });
};

const collectFromSourceFile = (
  declarationsByFilePath: EndpointPermissionDeclarationsByFilePath,
  sourceFile: ts.SourceFile,
): void => {
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const calleeName = node.expression.text;
      const nameArgumentNames =
        NAME_ARGUMENTS_BY_APPLICATION_TARGET_DECORATOR.get(calleeName);

      if (calleeName === AUTH_PRINCIPAL_GUARD) {
        collectAuthPrincipalGuard(declarationsByFilePath, node);
      } else if (isDefined(nameArgumentNames)) {
        collectApplicationTarget(
          declarationsByFilePath,
          node,
          calleeName,
          nameArgumentNames,
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
};

export const collectEndpointPermissionDeclarations =
  (): EndpointPermissionDeclarationsByFilePath => {
    const declarationsByFilePath: EndpointPermissionDeclarationsByFilePath = {};

    const sourceFilePaths = readdirSync(SOURCE_ROOT_PATH, {
      recursive: true,
      encoding: 'utf8',
    })
      .filter(isScannedSourceFilePath)
      .sort();

    for (const sourceFilePath of sourceFilePaths) {
      const absoluteFilePath = join(SOURCE_ROOT_PATH, sourceFilePath);
      const sourceText = readFileSync(absoluteFilePath, 'utf8');

      if (
        !sourceText.includes(AUTH_PRINCIPAL_GUARD) &&
        !sourceText.includes('ApplicationTarget')
      ) {
        continue;
      }

      collectFromSourceFile(
        declarationsByFilePath,
        ts.createSourceFile(
          absoluteFilePath,
          sourceText,
          ts.ScriptTarget.Latest,
          true,
        ),
      );
    }

    return declarationsByFilePath;
  };
