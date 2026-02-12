import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

export const RULE_NAME = 'export-component-props';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-export-component-props"
export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure types/interfaces ending with "Props" are exported',
    },
    fixable: 'code',
    schema: [],
    messages: {
      mustExportProps:
        "Props type '{{ typeName }}' must be exported.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const reExportedNames = new Set<string>();
    const unexportedPropsNodes = new Map<
      string,
      | TSESTree.TSTypeAliasDeclaration
      | TSESTree.TSInterfaceDeclaration
    >();

    const collectUnexportedProps = (
      node:
        | TSESTree.TSTypeAliasDeclaration
        | TSESTree.TSInterfaceDeclaration,
    ) => {
      const typeName = node.id.name;

      if (!typeName.endsWith('Props')) {
        return;
      }

      const isExported =
        node.parent?.type ===
        TSESTree.AST_NODE_TYPES.ExportNamedDeclaration;

      if (!isExported) {
        unexportedPropsNodes.set(typeName, node);
      }
    };

    return {
      TSTypeAliasDeclaration: collectUnexportedProps,
      TSInterfaceDeclaration: collectUnexportedProps,

      ExportNamedDeclaration: (
        node: TSESTree.ExportNamedDeclaration,
      ) => {
        for (const specifier of node.specifiers) {
          if (
            specifier.type ===
              TSESTree.AST_NODE_TYPES.ExportSpecifier &&
            isIdentifier(specifier.local)
          ) {
            const name = specifier.local.name;

            if (name.endsWith('Props')) {
              reExportedNames.add(name);
            }
          }
        }
      },

      'Program:exit': () => {
        for (const [typeName, node] of unexportedPropsNodes) {
          if (reExportedNames.has(typeName)) {
            continue;
          }

          context.report({
            node: node.id,
            messageId: 'mustExportProps',
            data: { typeName },
            fix: (fixer) => {
              const sourceCode = context.sourceCode;
              const firstToken = sourceCode.getFirstToken(node);
              const target = firstToken ?? node;

              if (firstToken?.value === 'export') {
                return null;
              }

              return fixer.insertTextBefore(target, 'export ');
            },
          });
        }
      },
    };
  },
});
