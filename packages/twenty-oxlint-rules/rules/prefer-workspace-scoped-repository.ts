import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'prefer-workspace-scoped-repository';

// Entities that legitimately do not fit the workspace-scoped wrapper:
// the workspace itself, pivots, nullable-workspaceId rows, and global
// tables with no workspaceId column.
const STRUCTURAL_EXEMPTIONS = new Set<string>([
  'WorkspaceEntity',
  'UserWorkspaceEntity',
  'AppTokenEntity',
  'ApplicationRegistrationEntity',

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

// Workspace-scoped entities still injected raw at one or more call
// sites. Routed here to keep the rule enforceable without forcing a
// repo-wide migration in a single change. Removing an entry forces
// every raw @InjectRepository site for it to switch to the wrapper or
// carry an explicit eslint-disable.
const WORKSPACE_SCOPED_EXEMPTIONS = new Set<string>([
  'ApplicationEntity',
  'ApplicationRegistrationVariableEntity',
  'CalendarChannelEntity',
  'CommandMenuItemEntity',
  'DataSourceEntity',
  'FieldMetadataEntity',
  'FieldPermissionEntity',
  'IndexMetadataEntity',
  'KeyValuePairEntity',
  'MessageChannelEntity',
  'NavigationMenuItemEntity',
  'ObjectMetadataEntity',
  'ObjectPermissionEntity',
  'PageLayoutEntity',
  'PageLayoutTabEntity',
  'PageLayoutWidgetEntity',
  'PermissionFlagEntity',
  'RoleEntity',
  'RoleTargetEntity',
  'RowLevelPermissionPredicateEntity',
  'RowLevelPermissionPredicateGroupEntity',
  'SkillEntity',
  'UpgradeMigrationEntity',
  'ViewEntity',
  'ViewFieldEntity',
  'ViewFieldGroupEntity',
  'ViewFilterEntity',
  'ViewFilterGroupEntity',
  'ViewGroupEntity',
  'ViewSortEntity',
  'WebhookEntity',
]);

// Entities allowed to be injected via raw @InjectRepository. Every
// other @InjectRepository(*Entity) site must go through
// @InjectWorkspaceScopedRepository so workspaceId is enforced on every
// read/write. New entities default to enforcement.
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
        'Disallow raw @InjectRepository for workspace-scoped entities. Entities carrying a workspaceId must be injected via @InjectWorkspaceScopedRepository so the workspaceId guard is enforced on every read/write. Entities that do not fit the wrapper are listed in the EXCLUSIONS set in this rule.',
    },
    schema: [],
    messages: {
      preferWorkspaceScopedRepository:
        "{{entityName}} must be injected via @InjectWorkspaceScopedRepository({{entityName}}) returning WorkspaceScopedRepository<{{entityName}}>. Raw @InjectRepository bypasses the workspaceId guard that prevents cross-workspace data access. If {{entityName}} genuinely does not fit (no workspaceId column, cross-tenant lookup, etc.), either add it to the EXCLUSIONS set in this rule or suppress with `// eslint-disable-next-line twenty/prefer-workspace-scoped-repository` and a short reason.",
    },
  },
  create: (context) => {
    return {
      MethodDefinition: (node: any) => {
        if (node.kind !== 'constructor') {
          return;
        }

        for (const param of node.value.params ?? []) {
          // Parameter decorators live on `.decorators` for both
          // TSParameterProperty (e.g. `private readonly foo`) and plain
          // parameters (e.g. `foo: Foo`). Checking both covers shorthand
          // and explicit-assignment constructor forms.
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
