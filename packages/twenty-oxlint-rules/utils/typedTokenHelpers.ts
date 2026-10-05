// Guards that authenticate the request themselves (file tokens) or mark it public.
const AUTH_GUARD_NAMES = [
  'PublicEndpointGuard',
  'FilePathGuard',
  'FileByIdGuard',
  'ServerFileByIdGuard',
  'FileUploadTokenGuard',
];

const AUTH_PRINCIPAL_GUARD_NAME = 'AuthPrincipalGuard';

// They put the principal on the request, which AuthPrincipalGuard then reads.
export const AUTHENTICATING_GUARD_NAMES = ['JwtAuthGuard', 'McpAuthGuard'];

const getUseGuardsArgumentLists = (node: any): any[][] => {
  if (!node.decorators) {
    return [];
  }

  return node.decorators
    .filter(
      (decorator: any) =>
        decorator.expression.type === 'CallExpression' &&
        decorator.expression.callee.type === 'Identifier' &&
        decorator.expression.callee.name === 'UseGuards',
    )
    .map((decorator: any) => decorator.expression.arguments);
};

const getUseGuardsArguments = (node: any): any[] =>
  getUseGuardsArgumentLists(node).flat();

const isAuthPrincipalGuardCall = (node: any): boolean =>
  node.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === AUTH_PRINCIPAL_GUARD_NAME;

const isBooleanLiteral = (node: any): boolean =>
  node.type === 'Literal' && typeof node.value === 'boolean';

const isTrueLiteral = (node: any): boolean =>
  node?.type === 'Literal' && node.value === true;

// Only literals, so the principals an endpoint accepts can be read at the endpoint.
const isInlineAuthPrincipalGuardConfig = (node: any): boolean =>
  node.type === 'ObjectExpression' &&
  node.properties.every(
    (property: any) =>
      property.type === 'Property' &&
      !property.computed &&
      !property.shorthand &&
      (isBooleanLiteral(property.value) ||
        isInlineAuthPrincipalGuardConfig(property.value)),
  );

const isAuthPrincipalGuardWithInlineConfig = (node: any): boolean =>
  isAuthPrincipalGuardCall(node) &&
  node.arguments.length === 1 &&
  isInlineAuthPrincipalGuardConfig(node.arguments[0]);

const getPropertyName = (property: any): string =>
  property.key.name ?? property.key.value;

const getPropertyValue = (objectNode: any, propertyName: string): any =>
  objectNode.properties.find(
    (property: any) => getPropertyName(property) === propertyName,
  )?.value;

const isVariantsConfig = (kindConfig: any): boolean =>
  kindConfig?.type === 'ObjectExpression';

// Kinds and variants are read from the two configs rather than listed here,
// so this cannot drift from AuthPrincipalGuardConfig.
const getPrincipalsRefusedByClassGuard = (
  methodGuard: any,
  classGuard: any,
): string[] => {
  const classConfig = classGuard.arguments[0];

  return methodGuard.arguments[0].properties.flatMap((property: any) => {
    const kind = getPropertyName(property);
    const methodKindConfig = property.value;
    const classKindConfig = getPropertyValue(classConfig, kind);

    if (isTrueLiteral(classKindConfig)) {
      return [];
    }

    if (isTrueLiteral(methodKindConfig)) {
      return isVariantsConfig(classKindConfig)
        ? classKindConfig.properties
            .filter((variant: any) => !isTrueLiteral(variant.value))
            .map((variant: any) => `${kind}.${getPropertyName(variant)}`)
        : [kind];
    }

    if (!isVariantsConfig(methodKindConfig)) {
      return [];
    }

    return methodKindConfig.properties
      .filter(
        (variant: any) =>
          isTrueLiteral(variant.value) &&
          !(
            isVariantsConfig(classKindConfig) &&
            isTrueLiteral(
              getPropertyValue(classKindConfig, getPropertyName(variant)),
            )
          ),
      )
      .map((variant: any) => `${kind}.${getPropertyName(variant)}`);
  });
};

const isPlacedFirst = (guardArguments: any[], index: number): boolean =>
  index === 0 ||
  (index === 1 &&
    guardArguments[0].type === 'Identifier' &&
    AUTHENTICATING_GUARD_NAMES.includes(guardArguments[0].name));

export const typedTokenHelpers = {
  nodeHasDecoratorsNamed: (node: any, decoratorNames: string[]): boolean => {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator: any) => {
      if (decorator.expression.type === 'Identifier') {
        return decoratorNames.includes(decorator.expression.name);
      }

      if (decorator.expression.type === 'CallExpression') {
        const callee = decorator.expression.callee;
        if (callee.type === 'Identifier') {
          return decoratorNames.includes(callee.name);
        }
      }

      return false;
    });
  },

  nodeHasAuthGuards: (node: any): boolean =>
    getUseGuardsArguments(node).some(
      (arg: any) =>
        (arg.type === 'Identifier' && AUTH_GUARD_NAMES.includes(arg.name)) ||
        isAuthPrincipalGuardWithInlineConfig(arg),
    ),

  getAuthPrincipalGuardsWithoutInlineConfig: (node: any): any[] =>
    getUseGuardsArguments(node).filter(
      (arg: any) =>
        isAuthPrincipalGuardCall(arg) &&
        !isAuthPrincipalGuardWithInlineConfig(arg),
    ),

  getMisplacedAuthPrincipalGuards: (node: any): any[] =>
    getUseGuardsArgumentLists(node).flatMap((guardArguments) =>
      guardArguments.filter(
        (arg: any, index: number) =>
          isAuthPrincipalGuardCall(arg) &&
          !isPlacedFirst(guardArguments, index),
      ),
    ),

  getInlineAuthPrincipalGuards: (node: any): any[] =>
    getUseGuardsArguments(node).filter(isAuthPrincipalGuardWithInlineConfig),

  getPrincipalsRefusedByClassGuard,

  nodeHasPermissionsGuard: (node: any): boolean => {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator: any) => {
      if (
        decorator.expression.type === 'CallExpression' &&
        decorator.expression.callee.type === 'Identifier' &&
        decorator.expression.callee.name === 'UseGuards'
      ) {
        return decorator.expression.arguments.some((arg: any) => {
          if (arg.type === 'CallExpression') {
            const callee = arg.callee;
            if (callee.type === 'Identifier') {
              return callee.name.endsWith('PermissionGuard');
            }
          }
          if (arg.type === 'Identifier') {
            return arg.name.endsWith('PermissionGuard');
          }
          return false;
        });
      }
      return false;
    });
  },
};
