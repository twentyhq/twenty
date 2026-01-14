import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'inject-workspace-repository';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure class names and file names follow the required pattern when using @InjectWorkspaceRepository.',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      invalidClassName: "Class name should end with 'WorkspaceService'.",
      invalidFileName: "File name should end with '.workspace-service.ts'.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      MethodDefinition: (node: TSESTree.MethodDefinition) => {
        const filename = context.filename;

        // Only check files that end with '.workspace-service.ts' or '.service.ts'
        if (
          !filename.endsWith('.workspace-service.ts') &&
          !filename.endsWith('.service.ts')
        ) {
          return;
        }

        if (node.kind === 'constructor') {
          const hasInjectWorkspaceRepositoryDecoratorOrWorkspaceService =
            node.value.params.some((param) => {
              if (param.type === TSESTree.AST_NODE_TYPES.TSParameterProperty) {
                const hasDecorator = param.decorators?.some((decorator) => {
                  return (
                    decorator.expression.type ===
                      TSESTree.AST_NODE_TYPES.CallExpression &&
                    (decorator.expression.callee as TSESTree.Identifier)
                      .name === 'InjectWorkspaceRepository'
                  );
                });
                const hasWorkspaceServiceType =
                  param.parameter.typeAnnotation?.typeAnnotation &&
                  param.parameter.typeAnnotation.typeAnnotation.type ===
                    TSESTree.AST_NODE_TYPES.TSTypeReference &&
                  (
                    param.parameter.typeAnnotation.typeAnnotation
                      .typeName as TSESTree.Identifier
                  ).name.endsWith('WorkspaceService');

                return hasDecorator || hasWorkspaceServiceType;
              }

              return false;
            });

          if (hasInjectWorkspaceRepositoryDecoratorOrWorkspaceService) {
            const className = (node.parent.parent as TSESTree.ClassDeclaration)
              .id?.name;
            const filename = context.filename;

            if (!className?.endsWith('WorkspaceService')) {
              context.report({
                node: node.parent,
                messageId: 'invalidClassName',
              });
            }

            if (!filename.endsWith('.workspace-service.ts')) {
              context.report({
                node: node.parent,
                messageId: 'invalidFileName',
              });
            }
          }
        }
      },
    };
  },
});

export default rule;
