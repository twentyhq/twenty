import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'enforce-module-boundaries';

const PACKAGE_TAG_MAP: Record<string, string[]> = {
  'twenty-front': ['scope:frontend'],
  'twenty-server': ['scope:backend'],
  'twenty-ui': ['scope:shared'],
  'twenty-shared': ['scope:shared'],
  'twenty-emails': ['scope:backend'],
  'twenty-sdk': ['scope:sdk', 'scope:shared'],
  'twenty-zapier': ['scope:zapier'],
  'twenty-oxlint-rules': ['scope:shared'],
  'twenty-docs': ['scope:docs'],
  'twenty-e2e-testing': ['scope:testing'],
  'create-twenty-app': ['scope:create-app'],
};

const WORKSPACE_PACKAGES = Object.keys(PACKAGE_TAG_MAP);

type DepConstraint = {
  sourceTag: string;
  onlyDependOnLibsWithTags: string[];
};

const extractPackageFromPath = (filePath: string): string | null => {
  const match = filePath.match(/packages\/([^/]+)\//);

  return match ? match[1] : null;
};

const resolveImportPackage = (importSource: string): string | null => {
  for (const packageName of WORKSPACE_PACKAGES) {
    if (
      importSource === packageName ||
      importSource.startsWith(`${packageName}/`)
    ) {
      return packageName;
    }
  }

  if (importSource.startsWith('@/')) {
    return null;
  }

  return null;
};

const isImportAllowed = (
  sourcePackage: string,
  targetPackage: string,
  depConstraints: DepConstraint[],
): boolean => {
  if (sourcePackage === targetPackage) {
    return true;
  }

  const sourceTags = PACKAGE_TAG_MAP[sourcePackage] ?? [];
  const targetTags = PACKAGE_TAG_MAP[targetPackage] ?? [];

  for (const constraint of depConstraints) {
    if (!sourceTags.includes(constraint.sourceTag)) {
      continue;
    }

    const allowed = targetTags.some((targetTag) =>
      constraint.onlyDependOnLibsWithTags.includes(targetTag),
    );

    if (!allowed) {
      return false;
    }
  }

  return true;
};

const checkImport = (
  node: any,
  context: any,
  depConstraints: DepConstraint[],
) => {
  const importSource = node.source?.value;

  if (!importSource || typeof importSource !== 'string') {
    return;
  }

  const targetPackage = resolveImportPackage(importSource);

  if (!targetPackage) {
    return;
  }

  const sourcePackage = extractPackageFromPath(context.filename);

  if (!sourcePackage) {
    return;
  }

  if (!isImportAllowed(sourcePackage, targetPackage, depConstraints)) {
    context.report({
      node,
      messageId: 'moduleBoundaryViolation',
      data: {
        sourcePackage,
        targetPackage,
        importSource,
      },
    });
  }
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce module boundaries between packages based on scope tags',
    },
    schema: [
      {
        type: 'object',
        properties: {
          depConstraints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sourceTag: { type: 'string' },
                onlyDependOnLibsWithTags: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    ],
    messages: {
      moduleBoundaryViolation:
        "Package '{{ sourcePackage }}' cannot import from '{{ targetPackage }}' (import '{{ importSource }}'). Check depConstraints configuration.",
    },
  },
  create: (context) => {
    const options = (context.options as [{ depConstraints: DepConstraint[] }])?.[0];
    const depConstraints = options?.depConstraints ?? [];

    if (depConstraints.length === 0) {
      return {};
    }

    return {
      ImportDeclaration: (node: any) => {
        checkImport(node, context, depConstraints);
      },
      ImportExpression: (node: any) => {
        if (node.source?.type === 'Literal') {
          checkImport(
            { source: node.source },
            context,
            depConstraints,
          );
        }
      },
    };
  },
});
