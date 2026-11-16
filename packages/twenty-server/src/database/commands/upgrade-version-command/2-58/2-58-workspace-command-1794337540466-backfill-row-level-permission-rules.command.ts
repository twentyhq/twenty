import { Command } from 'nest-commander';
import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildRowLevelPermissionRules } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/build-row-level-permission-rules.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type RuleLink = { id: string; rowLevelPermissionRuleId: string };

@RegisteredWorkspaceCommand('2.58.0', 1794337540466)
@Command({
  name: 'upgrade:2-58:backfill-row-level-permission-rules',
  description:
    'Create a row level permission rule per root predicate group and per set of ungrouped predicates, and link predicates, groups and field permissions to it',
})
export class BackfillRowLevelPermissionRulesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    // A cache computed before the upgrade forces all records off where predicates exist, which would zero the grants copied below
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);

    const {
      flatApplicationMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRowLevelPermissionRuleMaps,
      flatFieldPermissionMaps,
      rolesPermissions,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatApplicationMaps',
      'flatRoleMaps',
      'flatObjectMetadataMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatRowLevelPermissionRuleMaps',
      'flatFieldPermissionMaps',
      'rolesPermissions',
    ]);

    const predicateGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(({ deletedAt }) => !isDefined(deletedAt));
    const predicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(({ deletedAt }) => !isDefined(deletedAt));

    if (predicateGroups.length === 0 && predicates.length === 0) {
      return;
    }

    const {
      rules,
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier,
      ruleUniversalIdentifierByPredicateUniversalIdentifier,
    } = buildRowLevelPermissionRules({
      predicateGroups,
      predicates,
      now: new Date().toISOString(),
    });

    const ruleIdByUniversalIdentifier = new Map<string, string>();
    const rulesToInsert: {
      id: string;
      universalIdentifier: string;
      applicationId: string;
      roleId: string;
      objectMetadataId: string;
      grants: boolean[];
    }[] = [];

    for (const rule of rules) {
      const existingRule =
        flatRowLevelPermissionRuleMaps.byUniversalIdentifier[
          rule.universalIdentifier
        ];

      if (isDefined(existingRule)) {
        ruleIdByUniversalIdentifier.set(
          rule.universalIdentifier,
          existingRule.id,
        );
        continue;
      }

      const applicationId =
        flatApplicationMaps.idByUniversalIdentifier[
          rule.applicationUniversalIdentifier
        ];
      const roleId =
        flatRoleMaps.byUniversalIdentifier[rule.roleUniversalIdentifier]?.id;
      const objectMetadataId =
        flatObjectMetadataMaps.byUniversalIdentifier[
          rule.objectMetadataUniversalIdentifier
        ]?.id;

      if (
        !isDefined(applicationId) ||
        !isDefined(roleId) ||
        !isDefined(objectMetadataId)
      ) {
        this.logger.warn(
          `Workspace ${workspaceId}: skipping rule ${rule.universalIdentifier}, its application, role or object is missing`,
        );
        continue;
      }

      const id = v4();
      // Before rules, the object permission granted what the predicates filtered; the rule now carries it
      const objectRecordsPermissions =
        rolesPermissions[roleId]?.objects[objectMetadataId];

      ruleIdByUniversalIdentifier.set(rule.universalIdentifier, id);
      rulesToInsert.push({
        id,
        universalIdentifier: rule.universalIdentifier,
        applicationId,
        roleId,
        objectMetadataId,
        grants: [
          objectRecordsPermissions?.canCreateAllRecords ?? false,
          objectRecordsPermissions?.canReadAllRecords ?? false,
          objectRecordsPermissions?.canUpdateAllRecords ?? false,
          objectRecordsPermissions?.canSoftDeleteAllRecords ?? false,
          objectRecordsPermissions?.canDestroyAllRecords ?? false,
        ],
      });
    }

    const toRuleLinks = <
      TEntity extends {
        id: string;
        universalIdentifier: string;
        rowLevelPermissionRuleId: string | null;
      },
    >({
      entities,
      findRuleUniversalIdentifier,
    }: {
      entities: TEntity[];
      findRuleUniversalIdentifier: (entity: TEntity) => string | undefined;
    }): RuleLink[] =>
      entities.flatMap((entity) => {
        const ruleUniversalIdentifier = findRuleUniversalIdentifier(entity);
        const rowLevelPermissionRuleId = isDefined(ruleUniversalIdentifier)
          ? ruleIdByUniversalIdentifier.get(ruleUniversalIdentifier)
          : undefined;

        return isDefined(rowLevelPermissionRuleId) &&
          rowLevelPermissionRuleId !== entity.rowLevelPermissionRuleId
          ? [{ id: entity.id, rowLevelPermissionRuleId }]
          : [];
      });

    const predicateGroupLinks = toRuleLinks({
      entities: predicateGroups,
      findRuleUniversalIdentifier: ({ universalIdentifier }) =>
        ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
          universalIdentifier,
        ),
    });
    const predicateLinks = toRuleLinks({
      entities: predicates,
      findRuleUniversalIdentifier: ({ universalIdentifier }) =>
        ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
          universalIdentifier,
        ),
    });
    const fieldPermissionLinks = toRuleLinks({
      entities: Object.values(
        flatFieldPermissionMaps.byUniversalIdentifier,
      ).filter(isDefined),
      findRuleUniversalIdentifier: ({
        rowLevelPermissionPredicateGroupUniversalIdentifier,
      }) =>
        isDefined(rowLevelPermissionPredicateGroupUniversalIdentifier)
          ? ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
              rowLevelPermissionPredicateGroupUniversalIdentifier,
            )
          : undefined,
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${rulesToInsert.length} rule(s) to create, ${predicateGroupLinks.length} group(s), ${predicateLinks.length} predicate(s) and ${fieldPermissionLinks.length} field permission(s) to link`,
    );

    if (options.dryRun) {
      return;
    }

    await dataSource.transaction(async (entityManager) => {
      if (rulesToInsert.length > 0) {
        await entityManager.query(
          `INSERT INTO core."rowLevelPermissionRule"
             (id, "workspaceId", "universalIdentifier", "applicationId", "roleId", "objectMetadataId",
              "canCreateRecords", "canReadRecords", "canUpdateRecords", "canSoftDeleteRecords", "canDestroyRecords")
           SELECT rule.id, $1, rule."universalIdentifier", rule."applicationId", rule."roleId", rule."objectMetadataId",
              rule."canCreateRecords", rule."canReadRecords", rule."canUpdateRecords", rule."canSoftDeleteRecords", rule."canDestroyRecords"
           FROM unnest($2::uuid[], $3::uuid[], $4::uuid[], $5::uuid[], $6::uuid[],
                       $7::boolean[], $8::boolean[], $9::boolean[], $10::boolean[], $11::boolean[])
             AS rule(id, "universalIdentifier", "applicationId", "roleId", "objectMetadataId",
                     "canCreateRecords", "canReadRecords", "canUpdateRecords", "canSoftDeleteRecords", "canDestroyRecords")`,
          [
            workspaceId,
            rulesToInsert.map(({ id }) => id),
            rulesToInsert.map(({ universalIdentifier }) => universalIdentifier),
            rulesToInsert.map(({ applicationId }) => applicationId),
            rulesToInsert.map(({ roleId }) => roleId),
            rulesToInsert.map(({ objectMetadataId }) => objectMetadataId),
            ...[0, 1, 2, 3, 4].map((grantIndex) =>
              rulesToInsert.map(({ grants }) => grants[grantIndex]),
            ),
          ],
        );

        const roleObjectPairs = [
          ...new Map(
            rulesToInsert.map(({ roleId, objectMetadataId }) => [
              `${roleId}:${objectMetadataId}`,
              { roleId, objectMetadataId },
            ]),
          ).values(),
        ].flatMap(({ roleId, objectMetadataId }) => {
          const flatRole = Object.values(flatRoleMaps.byUniversalIdentifier)
            .filter(isDefined)
            .find(({ id }) => id === roleId);
          const flatObjectMetadata = Object.values(
            flatObjectMetadataMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .find(({ id }) => id === objectMetadataId);

          return isDefined(flatRole) && isDefined(flatObjectMetadata)
            ? [
                {
                  roleId,
                  objectMetadataId,
                  applicationId: flatRole.applicationId,
                  universalIdentifier: getObjectPermissionUniversalIdentifier({
                    applicationUniversalIdentifier:
                      flatRole.applicationUniversalIdentifier,
                    roleUniversalIdentifier: flatRole.universalIdentifier,
                    objectUniversalIdentifier:
                      flatObjectMetadata.universalIdentifier,
                  }),
                },
              ]
            : [];
        });

        // All records would now win over the rules, so the object grant moves to them
        await entityManager.query(
          `INSERT INTO core."objectPermission"
             ("workspaceId", "universalIdentifier", "applicationId", "roleId", "objectMetadataId",
              "canCreateObjectRecords", "canReadObjectRecords", "canUpdateObjectRecords",
              "canSoftDeleteObjectRecords", "canDestroyObjectRecords")
           SELECT $1, pair."universalIdentifier", pair."applicationId", pair."roleId", pair."objectMetadataId",
              false, false, false, false, false
           FROM unnest($2::uuid[], $3::uuid[], $4::uuid[], $5::uuid[])
             AS pair("universalIdentifier", "applicationId", "roleId", "objectMetadataId")
           ON CONFLICT ("objectMetadataId", "roleId") DO UPDATE SET
             "canCreateObjectRecords" = false, "canReadObjectRecords" = false,
             "canUpdateObjectRecords" = false, "canSoftDeleteObjectRecords" = false,
             "canDestroyObjectRecords" = false`,
          [
            workspaceId,
            roleObjectPairs.map(({ universalIdentifier }) => universalIdentifier),
            roleObjectPairs.map(({ applicationId }) => applicationId),
            roleObjectPairs.map(({ roleId }) => roleId),
            roleObjectPairs.map(({ objectMetadataId }) => objectMetadataId),
          ],
        );
      }

      for (const [tableName, links] of [
        ['rowLevelPermissionPredicateGroup', predicateGroupLinks],
        ['rowLevelPermissionPredicate', predicateLinks],
        ['fieldPermission', fieldPermissionLinks],
      ] as const) {
        if (links.length === 0) {
          continue;
        }

        await entityManager.query(
          `UPDATE core."${tableName}" AS entity
           SET "rowLevelPermissionRuleId" = link."rowLevelPermissionRuleId"
           FROM unnest($2::uuid[], $3::uuid[]) AS link(id, "rowLevelPermissionRuleId")
           WHERE entity.id = link.id AND entity."workspaceId" = $1`,
          [
            workspaceId,
            links.map(({ id }) => id),
            links.map(({ rowLevelPermissionRuleId }) => rowLevelPermissionRuleId),
          ],
        );
      }
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatObjectPermissionMaps',
      'rolesPermissions',
      'flatRowLevelPermissionRuleMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatFieldPermissionMaps',
    ]);
  }
}
