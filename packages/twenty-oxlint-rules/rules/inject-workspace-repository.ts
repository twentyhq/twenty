import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'inject-workspace-repository';

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure class names and file names follow the required pattern when using @InjectWorkspaceRepository.',
    },
    schema: [],
    messages: {
      invalidClassName: "Class name should end with 'WorkspaceService'.",
      invalidFileName:
        "File name should end with '.workspace-service.ts'.",
    },
  },
  create: (context) => {
    return {
      MethodDefinition: (node: any) => {
        const filename = context.filename;

        if (
          !filename.endsWith('.workspace-service.ts') &&
          !filename.endsWith('.service.ts')
        ) {
          return;
        }

        if (node.kind === 'constructor') {
          const hasInjectWorkspaceRepositoryDecoratorOrWorkspaceService =
            node.value.params.some((param: any) => {
              if (param.type === 'TSParameterProperty') {
                const hasDecorator = param.decorators?.some(
                  (decorator: any) => {
                    return (
                      decorator.expression.type === 'CallExpression' &&
                      (decorator.expression.callee as any).name ===
                        'InjectWorkspaceRepository'
                    );
                  },
                );
                const hasWorkspaceServiceType =
                  param.parameter.typeAnnotation?.typeAnnotation &&
                  param.parameter.typeAnnotation.typeAnnotation.type ===
                    'TSTypeReference' &&
                  (
                    param.parameter.typeAnnotation.typeAnnotation
                      .typeName as any
                  ).name.endsWith('WorkspaceService');

                return hasDecorator || hasWorkspaceServiceType;
              }
              return false;
            });

          if (
            hasInjectWorkspaceRepositoryDecoratorOrWorkspaceService
          ) {
            const className = (node.parent.parent as any).id?.name;
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
