import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'prefer-workspace-scoped-repository';

// Entities that MUST be accessed through WorkspaceScopedRepository
// (@InjectWorkspaceScopedRepository) — using the raw TypeORM repository
// (@InjectRepository) on any of these is a lint error.
//
// Each entry is a core- or metadata-schema entity carrying a
// workspaceId column. The list expresses intent: every such entity
// belongs here. Entities still in active migration keep their
// existing raw call sites suppressed with `// eslint-disable-next-line
// twenty/prefer-workspace-scoped-repository` plus a
// `TODO(workspace-scoped)` note, so the blacklist captures the
// eventual goal rather than just what's already been refactored.
//
// Note on naming: "blacklist" here means "entities forbidden from raw
// @InjectRepository". It is *not* a list of entities the rule opts
// into checking — the rule's enforcement scope is the entire codebase,
// and this set is what triggers the error.
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
  'FileEntity',
  'BillingCustomerEntity',
  'BillingSubscriptionEntity',
  'BillingEntitlementEntity',
  // Listed but not yet migrated — existing call sites are temporarily
  // suppressed with eslint-disable + TODO(workspace-scoped) markers.
  'UserWorkspaceEntity',
]);

// Intentionally NOT on the blacklist:
// - AppTokenEntity: workspaceId is nullable by design (password-reset
//   tokens are minted before the user picks a workspace), so the
//   wrapper's "workspaceId required" contract doesn't fit. Cross-tenant
//   lookups by token jti are also normal here.

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
