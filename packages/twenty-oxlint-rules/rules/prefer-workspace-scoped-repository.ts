import { defineRule } from '@oxlint/plugins';

import { type Equal, type Expect } from 'twenty-shared/testing';

import {
  STRUCTURAL_EXEMPTIONS,
  WORKSPACE_SCOPED_EXEMPTIONS,
} from './prefer-workspace-scoped-repository.exemptions';

export const RULE_NAME = 'prefer-workspace-scoped-repository';

// oxlint-disable-next-line no-unused-vars
type ExemptionListsAreDisjoint = Expect<
  Equal<
    Extract<
      (typeof STRUCTURAL_EXEMPTIONS)[number],
      (typeof WORKSPACE_SCOPED_EXEMPTIONS)[number]
    >,
    never
  >
>;

// Everything else must use @InjectWorkspaceScopedRepository.
const EXCLUSIONS = new Set<string>([
  ...STRUCTURAL_EXEMPTIONS,
  ...WORKSPACE_SCOPED_EXEMPTIONS,
]);

const matchInjectRepositoryEntity = (decorator: any): string | null => {
  if (decorator.expression?.type !== 'CallExpression') {
    return null;
  }

  const callee = decorator.expression.callee;

  if (callee?.type !== 'Identifier' || callee.name !== 'InjectRepository') {
    return null;
  }

  const [arg] = decorator.expression.arguments;

  if (arg?.type !== 'Identifier') {
    return null;
  }

  if (!arg.name.endsWith('Entity')) {
    return null;
  }

  if (EXCLUSIONS.has(arg.name)) {
    return null;
  }

  return arg.name;
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw @InjectRepository for workspace-scoped entities. Use @InjectWorkspaceScopedRepository so workspaceId is enforced on every read/write.',
    },
    schema: [],
    messages: {
      preferWorkspaceScopedRepository:
        'Use @InjectWorkspaceScopedRepository({{entityName}}) instead of raw @InjectRepository so the workspaceId guard is enforced. If {{entityName}} genuinely does not fit, add it to EXCLUSIONS or suppress with `// eslint-disable-next-line twenty/prefer-workspace-scoped-repository` and a short reason.',
    },
  },
  create: (context) => {
    return {
      MethodDefinition: (node: any) => {
        if (node.kind !== 'constructor') {
          return;
        }

        for (const param of node.value.params ?? []) {
          for (const decorator of param.decorators ?? []) {
            const entityName = matchInjectRepositoryEntity(decorator);

            if (entityName !== null) {
              context.report({
                node: decorator,
                messageId: 'preferWorkspaceScopedRepository',
                data: { entityName },
              });
            }
          }
        }
      },
    };
  },
});
