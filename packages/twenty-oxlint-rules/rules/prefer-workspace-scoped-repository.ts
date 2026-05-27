import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'prefer-workspace-scoped-repository';

// Entities that must be accessed through WorkspaceScopedRepository
// (i.e. @InjectWorkspaceScopedRepository) rather than the raw TypeORM
// repository. Each entry below is a core- or metadata-schema entity that
// carries a workspaceId column. Add new entities here as they are
// migrated to the wrapper.
const BLACKLIST = new Set<string>([
  'AgentTurnEntity',
  'AgentMessageEntity',
  'AgentMessagePartEntity',
  'AgentChatThreadEntity',
  'AgentTurnEvaluationEntity',
  'AgentEntity',
  'TwoFactorAuthenticationMethodEntity',
  'ApiKeyEntity',
  'FeatureFlagEntity',
  'ApprovedAccessDomainEntity',
  'EmailingDomainEntity',
  'PublicDomainEntity',
]);

const isInjectRepositoryDecoratorForBlacklistedEntity = (
  decorator: any,
): { entityName: string } | null => {
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

  if (!BLACKLIST.has(arg.name)) {
    return null;
  }

  return { entityName: arg.name };
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw @InjectRepository for entities that must go through WorkspaceScopedRepository. Workspace-scoped core-schema entities must be injected via @InjectWorkspaceScopedRepository so workspaceId is enforced on every read/write.',
    },
    schema: [],
    messages: {
      preferWorkspaceScopedRepository:
        "{{entityName}} must be injected via @InjectWorkspaceScopedRepository({{entityName}}) returning WorkspaceScopedRepository<{{entityName}}>. Raw @InjectRepository bypasses the workspaceId guard that prevents cross-workspace data access.",
    },
  },
  create: (context) => {
    return {
      MethodDefinition: (node: any) => {
        if (node.kind !== 'constructor') {
          return;
        }

        for (const param of node.value.params ?? []) {
          if (param.type !== 'TSParameterProperty') {
            continue;
          }

          for (const decorator of param.decorators ?? []) {
            const match = isInjectRepositoryDecoratorForBlacklistedEntity(
              decorator,
            );

            if (match !== null) {
              context.report({
                node: decorator,
                messageId: 'preferWorkspaceScopedRepository',
                data: { entityName: match.entityName },
              });
            }
          }
        }
      },
    };
  },
});
