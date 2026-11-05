// Guards that authenticate the request themselves (file tokens) or mark it public.
const AUTH_GUARD_NAMES = [
  'PublicEndpointGuard',
  'FilePathGuard',
  'FileByIdGuard',
  'FileUploadTokenGuard',
];

const ACCESS_POLICY_GUARD_NAME = 'AccessPolicyGuard';

// A named constant when several entry points share the operation, else an inline policy
const ACCESS_POLICY_CONSTANT_NAME_PATTERN = /^[A-Z][A-Z0-9_]*_ACCESS_POLICY$/;

// They put the principal on the request, which AccessPolicyGuard then reads.
export const AUTHENTICATING_GUARD_NAMES = ['JwtAuthGuard', 'McpAuthGuard'];

const getUseGuardsDecorators = (node: any): any[] =>
  (node.decorators ?? []).filter(
    (decorator: any) =>
      decorator.expression.type === 'CallExpression' &&
      decorator.expression.callee.type === 'Identifier' &&
      decorator.expression.callee.name === 'UseGuards',
  );

const getUseGuardsArgumentLists = (node: any): any[][] =>
  getUseGuardsDecorators(node).map(
    (decorator: any) => decorator.expression.arguments,
  );

const getUseGuardsArguments = (node: any): any[] =>
  getUseGuardsArgumentLists(node).flat();

const isAccessPolicyGuardCall = (node: any): boolean =>
  node.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === ACCESS_POLICY_GUARD_NAME;

const isAccessPolicyConstant = (node: any): boolean =>
  node.type === 'Identifier' &&
  ACCESS_POLICY_CONSTANT_NAME_PATTERN.test(node.name);

const isAuthenticatingGuard = (node: any): boolean =>
  node.type === 'Identifier' && AUTHENTICATING_GUARD_NAMES.includes(node.name);

const isBooleanLiteral = (node: any): boolean =>
  node.type === 'Literal' && typeof node.value === 'boolean';

// Only literals, so the principals an endpoint accepts can be read at the endpoint.
const isInlineAuthPrincipals = (node: any): boolean =>
  node.type === 'ObjectExpression' &&
  node.properties.every(
    (property: any) =>
      property.type === 'Property' &&
      !property.computed &&
      !property.shorthand &&
      (isBooleanLiteral(property.value) ||
        isInlineAuthPrincipals(property.value)),
  );

const getPropertyName = (property: any): string =>
  property.key.name ?? property.key.value;

const getPropertyValue = (objectNode: any, propertyName: string): any =>
  objectNode.properties.find(
    (property: any) => getPropertyName(property) === propertyName,
  )?.value;

const isArrayWithoutSpread = (node: any): boolean =>
  node.type === 'ArrayExpression' &&
  node.elements.every((element: any) => element?.type !== 'SpreadElement');

const isInlineAccessPolicy = (node: any): boolean =>
  node.type === 'ObjectExpression' &&
  node.properties.every(
    (property: any) =>
      property.type === 'Property' &&
      !property.computed &&
      !property.shorthand &&
      (getPropertyName(property) === 'authPrincipals'
        ? isInlineAuthPrincipals(property.value)
        : isArrayWithoutSpread(property.value)),
  ) &&
  getPropertyValue(node, 'authPrincipals')?.properties.length > 0 &&
  getPropertyValue(node, 'requiredPermissionFlags') !== undefined;

const isAccessPolicyGuardWithPolicy = (node: any): boolean =>
  isAccessPolicyGuardCall(node) &&
  node.arguments.length === 1 &&
  (isAccessPolicyConstant(node.arguments[0]) ||
    isInlineAccessPolicy(node.arguments[0]));

const isPlacedFirst = (guardArguments: any[], index: number): boolean =>
  index === 0 || (index === 1 && isAuthenticatingGuard(guardArguments[0]));

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
        isAccessPolicyGuardWithPolicy(arg),
    ),

  getAccessPolicyGuardsWithoutPolicy: (node: any): any[] =>
    getUseGuardsArguments(node).filter(
      (arg: any) =>
        isAccessPolicyGuardCall(arg) && !isAccessPolicyGuardWithPolicy(arg),
    ),

  getAccessPolicyGuards: (node: any): any[] =>
    getUseGuardsArguments(node).filter(isAccessPolicyGuardCall),

  getMisplacedAccessPolicyGuards: (node: any): any[] =>
    getUseGuardsArgumentLists(node).flatMap((guardArguments) =>
      guardArguments.filter(
        (arg: any, index: number) =>
          isAccessPolicyGuardCall(arg) && !isPlacedFirst(guardArguments, index),
      ),
    ),

  // Class guards run before method guards, so only those setting the principal may precede a method policy
  getClassGuardsRunningBeforeAccessPolicy: (classNode: any): any[] =>
    getUseGuardsArguments(classNode).filter(
      (arg: any) => !isAuthenticatingGuard(arg),
    ),

  // Nest applies decorators bottom-up, so stacked lists run against their reading order
  getStackedUseGuardsDecorators: (node: any): any[] =>
    getUseGuardsDecorators(node).slice(1),

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
          if (isAccessPolicyGuardWithPolicy(arg)) {
            return true;
          }
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
