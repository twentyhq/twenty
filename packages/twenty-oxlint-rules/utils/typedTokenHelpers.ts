// Guards that authenticate the request themselves (file tokens) or mark it public.
const AUTH_GUARD_NAMES = [
  'PublicEndpointGuard',
  'FilePathGuard',
  'FileByIdGuard',
  'FileUploadTokenGuard',
];

const AUTH_PRINCIPAL_GUARD_NAME = 'AuthPrincipalGuard';

// They put the principal on the request, which AuthPrincipalGuard then reads.
export const AUTHENTICATING_GUARD_NAMES = ['JwtAuthGuard', 'McpAuthGuard'];

export const REPLACED_AUTH_GUARD_NAMES = [
  'WorkspaceAuthGuard',
  'UserAuthGuard',
  'RequireUserSessionGuard',
  'RequireAccessTokenGuard',
  'UserOrApplicationAuthGuard',
  'NoImpersonationGuard',
];

const PRINCIPAL_VARIANTS_BY_KIND: Record<string, string[]> = {
  userSession: ['standard', 'impersonated', 'playground', 'workspaceAgnostic'],
  apiKey: [],
  oauthClient: ['withUser', 'withoutUser'],
  application: ['withUser', 'withoutUser'],
};

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

const getPropertyValue = (objectNode: any, propertyName: string): any =>
  objectNode.properties.find(
    (property: any) =>
      (property.key.name ?? property.key.value) === propertyName,
  )?.value;

const isPrincipalVariantAccepted = (
  kindConfig: any,
  variant: string,
): boolean =>
  isTrueLiteral(kindConfig) ||
  (kindConfig?.type === 'ObjectExpression' &&
    isTrueLiteral(getPropertyValue(kindConfig, variant)));

const getAcceptedPrincipalVariants = (authPrincipalGuard: any): string[] => {
  const config = authPrincipalGuard.arguments[0];

  return Object.entries(PRINCIPAL_VARIANTS_BY_KIND).flatMap(
    ([kind, variants]) => {
      const kindConfig = getPropertyValue(config, kind);

      if (variants.length === 0) {
        return isTrueLiteral(kindConfig) ? [kind] : [];
      }

      return variants
        .filter((variant) => isPrincipalVariantAccepted(kindConfig, variant))
        .map((variant) => `${kind}.${variant}`);
    },
  );
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

  getReplacedAuthGuards: (node: any): any[] =>
    getUseGuardsArguments(node).filter(
      (arg: any) =>
        arg.type === 'Identifier' &&
        REPLACED_AUTH_GUARD_NAMES.includes(arg.name),
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

  getAcceptedPrincipalVariants,

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
