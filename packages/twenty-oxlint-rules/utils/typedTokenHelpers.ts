
export const typedTokenHelpers = {
  nodeHasDecoratorsNamed: (
    node: any,
    decoratorNames: string[],
  ): boolean => {
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

  nodeHasAuthGuards: (node: any): boolean => {
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
          if (arg.type === 'Identifier') {
            return (
              arg.name === 'UserAuthGuard' ||
              arg.name === 'WorkspaceAuthGuard' ||
              arg.name === 'PublicEndpointGuard' ||
              arg.name === 'FilePathGuard' ||
              arg.name === 'FileByIdGuard'
            );
          }
          return false;
        });
      }

      return false;
    });
  },

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
