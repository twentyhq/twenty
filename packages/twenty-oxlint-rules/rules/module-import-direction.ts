import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'module-import-direction';

type ModuleImportDirection = {
  sourcePath: string;
  forbiddenImportPrefixes: string[];
  ignoredSourcePaths?: string[];
  reason: string;
};

const findViolatedDirection = (
  filename: string,
  importSource: string,
  directions: ModuleImportDirection[],
) =>
  directions.find(
    ({ sourcePath, forbiddenImportPrefixes, ignoredSourcePaths = [] }) =>
      filename.includes(sourcePath) &&
      !ignoredSourcePaths.some((ignoredSourcePath) =>
        filename.includes(ignoredSourcePath),
      ) &&
      forbiddenImportPrefixes.some((forbiddenImportPrefix) =>
        importSource.startsWith(forbiddenImportPrefix),
      ),
  );

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that a module does not import from a module that depends on it',
    },
    messages: {
      forbiddenImport: "'{{importSource}}' cannot be imported here: {{reason}}",
    },
    schema: [
      {
        type: 'object',
        properties: {
          directions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sourcePath: { type: 'string' },
                forbiddenImportPrefixes: {
                  type: 'array',
                  items: { type: 'string' },
                },
                ignoredSourcePaths: {
                  type: 'array',
                  items: { type: 'string' },
                },
                reason: { type: 'string' },
              },
              required: ['sourcePath', 'forbiddenImportPrefixes', 'reason'],
            },
          },
        },
      },
    ],
  },
  create: (context) => {
    const [options] = context.options as [
      { directions?: ModuleImportDirection[] } | undefined,
    ];
    const directions = options?.directions ?? [];

    const checkImportSource = (node: any) => {
      const importSource = node.source?.value;

      if (typeof importSource !== 'string') {
        return;
      }

      const violatedDirection = findViolatedDirection(
        context.filename.replace(/\\/g, '/'),
        importSource,
        directions,
      );

      if (violatedDirection !== undefined) {
        context.report({
          node,
          messageId: 'forbiddenImport',
          data: { importSource, reason: violatedDirection.reason },
        });
      }
    };

    return {
      ImportDeclaration: checkImportSource,
      ExportNamedDeclaration: checkImportSource,
      ExportAllDeclaration: checkImportSource,
      ImportExpression: checkImportSource,
    };
  },
});
