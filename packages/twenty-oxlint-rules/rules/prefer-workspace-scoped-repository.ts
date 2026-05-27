import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'prefer-workspace-scoped-repository';

// Entities allowed to be injected via raw @InjectRepository. Everything
// else matching @InjectRepository(*Entity) is required to go through
// @InjectWorkspaceScopedRepository so workspaceId is enforced on every
// read/write. New entities default to enforcement: add to this set only
// when raw access is genuinely the right shape (no workspaceId column,
// pivot/global table, or workspaceId-discovered-from-the-row patterns).
const EXCLUSIONS = new Set<string>([
  // Workspace itself / pivot / nullable workspaceId by design
  'WorkspaceEntity',
  'UserWorkspaceEntity',
  'AppTokenEntity',
  'ApplicationRegistrationEntity',

  // Global tables with no workspaceId column
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

  // Workspace-scoped entities currently outside the wrapper. Removing an
  // entry forces every raw @InjectRepository site for it to migrate to
  // the wrapper or carry an explicit eslint-disable.
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
          if (param.type !== 'TSParameterProperty') {
            continue;
          }

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
