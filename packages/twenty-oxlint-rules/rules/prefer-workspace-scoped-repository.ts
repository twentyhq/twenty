import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'prefer-workspace-scoped-repository';

// Entities that do not fit the scoped wrapper: workspace itself, pivots,
// nullable-workspaceId rows (instance-level config / migrations / tokens),
// and global tables with no workspaceId column at all.
const STRUCTURAL_EXEMPTIONS = new Set<string>([
  'WorkspaceEntity',
  'UserWorkspaceEntity',
  'AppTokenEntity',
  'ApplicationRegistrationEntity',
  'ApplicationRegistrationVariableEntity',
  // nullable workspaceId — both rows support instance-level and per-workspace use
  'KeyValuePairEntity',
  'UpgradeMigrationEntity',

  'ApplicationVariableEntity',
  'BillingMeterEntity',
  'BillingPriceEntity',
  'BillingProductEntity',
  'BillingSubscriptionItemEntity',
  'ConnectedAccountEntity',
  'ConnectionProviderEntity',
  'FrontComponentEntity',
  'LogicFunctionEntity',
  'MessageFolderEntity',
  'RolePermissionFlagEntity',
  'SigningKeyEntity',
  'UserEntity',
  'WorkspaceSSOIdentityProviderEntity',
]);

// Workspace-scoped entities the wrapper could technically wrap, but where
// the dominant access patterns are cross-workspace (request routing, auth,
// metadata sync, file storage, transaction-bound channel updates) and the
// payoff doesn't justify dual-injecting every call site or growing the
// wrapper API. Treat as a "deliberately not migrated" list, not a backlog.
const WORKSPACE_SCOPED_EXEMPTIONS = new Set<string>([
  // Resolved by id alone at auth/request-routing time and inside file-storage
  // transactions; very few of the ~50 call sites carry a workspaceId.
  'ApplicationEntity',
  // 20+ call sites across calendar/messaging modules; staged for a dedicated PR.
  'CalendarChannelEntity',
  'MessageChannelEntity',
  // The owning services `extends TypeOrmQueryService<E>` and pass the raw
  // repo to `super(...)`; the superclass type doesn't accept the wrapper.
  'FieldMetadataEntity',
  'ObjectMetadataEntity',
  // Only injection lives in a frozen historical upgrade-version-command
  // directory that CI's mutation-guard refuses to let us edit.
  'DataSourceEntity',
]);

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
