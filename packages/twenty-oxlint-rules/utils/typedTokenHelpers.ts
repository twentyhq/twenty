// Guards that authenticate the request themselves (file tokens) or mark it public.
const AUTH_GUARD_NAMES = [
  'PublicEndpointGuard',
  'FilePathGuard',
  'FileByIdGuard',
  'FileUploadTokenGuard',
];

const CALLER_GUARD_NAME = 'CallerGuard';

export const REPLACED_CALLER_GUARD_NAMES = [
  'WorkspaceAuthGuard',
  'UserAuthGuard',
  'RequireUserSessionGuard',
  'RequireAccessTokenGuard',
  'UserOrApplicationAuthGuard',
  'NoImpersonationGuard',
];

const getUseGuardsArguments = (node: any): any[] => {
  if (!node.decorators) {
    return [];
  }

  return node.decorators.flatMap((decorator: any) => {
    if (
      decorator.expression.type === 'CallExpression' &&
      decorator.expression.callee.type === 'Identifier' &&
      decorator.expression.callee.name === 'UseGuards'
    ) {
      return decorator.expression.arguments;
    }

    return [];
  });
};

const isCallerGuardCall = (node: any): boolean =>
  node.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === CALLER_GUARD_NAME;

// Only literals, so the callers an endpoint accepts can be read at the endpoint.
const isInlineCallerGuardConfig = (node: any): boolean =>
  node.type === 'ObjectExpression' &&
  node.properties.every(
    (property: any) =>
      property.type === 'Property' &&
      !property.computed &&
      !property.shorthand &&
      ((property.value.type === 'Literal' &&
        typeof property.value.value === 'boolean') ||
        isInlineCallerGuardConfig(property.value)),
  );

const isCallerGuardWithInlineConfig = (node: any): boolean =>
  isCallerGuardCall(node) &&
  node.arguments.length === 1 &&
  isInlineCallerGuardConfig(node.arguments[0]);

const isCallerGuardAcceptingNoCaller = (node: any): boolean =>
  isCallerGuardWithInlineConfig(node) &&
  node.arguments[0].properties.every(
    (property: any) =>
      property.value.type === 'Literal' && property.value.value === false,
  );

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
        isCallerGuardWithInlineConfig(arg),
    ),

  getReplacedCallerGuards: (node: any): any[] =>
    getUseGuardsArguments(node).filter(
      (arg: any) =>
        arg.type === 'Identifier' &&
        REPLACED_CALLER_GUARD_NAMES.includes(arg.name),
    ),

  getCallerGuardsWithoutInlineConfig: (node: any): any[] =>
    getUseGuardsArguments(node).filter(
      (arg: any) =>
        isCallerGuardCall(arg) && !isCallerGuardWithInlineConfig(arg),
    ),

  getCallerGuardsAcceptingNoCaller: (node: any): any[] =>
    getUseGuardsArguments(node).filter(isCallerGuardAcceptingNoCaller),

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
