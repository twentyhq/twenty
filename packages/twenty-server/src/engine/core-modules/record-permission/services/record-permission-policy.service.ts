import { installRecordPermissionPathIndexes } from 'src/engine/core-modules/record-permission/utils/install-record-permission-path-indexes.util';
import { hasRecordPermissionConditionChanges } from 'src/engine/core-modules/record-permission/utils/has-record-permission-condition-changes.util';
import { resolveRecordPermissionDefinition } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-definition.util';
import { getRecordCapabilities } from 'src/engine/core-modules/record-permission/utils/get-record-capabilities.util';
import { isRecordPermissionConditionMemberDependent } from 'src/engine/core-modules/record-permission/utils/is-record-permission-condition-member-dependent.util';
import { importRecordPermissionCondition } from 'src/engine/core-modules/record-permission/utils/import-record-permission-condition.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4, v5 } from 'uuid';
import {
  FeatureFlagKey,
  MetadataReadability,
  type RecordPermissionAction,
  type RecordPermissionPolicyDefinition,
} from 'twenty-shared/types';
import { isDefined, parseRecordPermissionPolicy } from 'twenty-shared/utils';

import {
  type RecordPermissionContext,
  type RecordPermissionAuthority,
  type RecordPermissionAccessGroup,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { installRecordPermissionStorage } from 'src/engine/core-modules/record-permission/utils/install-record-permission-storage.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { compileRecordPermissionGroup } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { RecordPermissionRevisionEntity } from 'src/engine/metadata-modules/record-permissions/entities/record-permission-revision.entity';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

const INITIAL_RULE_NAMESPACE = 'b6a26b7e-bce5-49bd-968e-074c27ab86b2';

@Injectable()
export class RecordPermissionPolicyService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
  ) {}

  async getState(workspaceId: string) {
    const revisions = await this.dataSource
      .getRepository(RecordPermissionRevisionEntity)
      .find({ where: { workspaceId }, order: { createdAt: 'DESC' }, take: 10 });
    const active =
      revisions.find((revision) => revision.status === 'active') ??
      (await this.dataSource
        .getRepository(RecordPermissionRevisionEntity)
        .findOneBy({ workspaceId, status: 'active' }));
    const candidate = revisions.find(
      (revision) =>
        revision.status === 'building' || revision.status === 'failed',
    );
    const definition =
      candidate?.definition ??
      active?.definition ??
      (await this.buildInitialDefinition(workspaceId));
    const progress =
      revisions.length === 0
        ? []
        : await this.dataSource.query(
            `SELECT "revisionId", sum(processed)::text AS processed, count(*) FILTER (WHERE complete)::int AS "completedObjects", count(*)::int AS "totalObjects" FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."recordPermissionScan" WHERE "revisionId" = ANY($1::uuid[]) GROUP BY "revisionId"`,
            [[active?.id, candidate?.id].filter(isDefined)],
          );

    const context = await this.loadContext(workspaceId, {
      id: active?.id ?? v4(),
      definition,
    });

    return {
      capabilitiesByObjectUniversalIdentifier:
        context.capabilitiesByObjectUniversalIdentifier,
      activeRevisionId: active?.id ?? null,
      activeDefinition: active?.definition ?? null,
      candidateRevisionId: candidate?.id ?? null,
      status: candidate?.status ?? active?.status ?? 'inactive',
      definition,
      progress,
      failureReason: candidate?.failureReason ?? null,
    };
  }

  async loadContext(
    workspaceId: string,
    revision: Pick<RecordPermissionRevisionEntity, 'id' | 'definition'>,
  ): Promise<RecordPermissionContext> {
    const { flatObjectMetadataMaps, flatFieldMetadataMapsOrm } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]);

    return {
      revisionId: revision.id,
      definition: resolveRecordPermissionDefinition(revision.definition, {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      }),
      schemaName: getWorkspaceSchemaName(workspaceId),
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      authorities: [],
      capabilitiesByObjectUniversalIdentifier: Object.fromEntries(
        Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
          .filter(isDefined)
          .map((object) => [
            object.universalIdentifier,
            getRecordCapabilities(object),
          ]),
      ),
    };
  }

  async createCandidate(
    workspaceId: string,
    input: unknown,
    expectedActiveRevisionId: string | null,
  ) {
    const definition = parseRecordPermissionPolicy(input);
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (
      !featureFlagsMap[FeatureFlagKey.IS_RECORD_PERMISSION_POLICIES_ENABLED]
    ) {
      throw new Error('Record permission editing is not enabled');
    }

    const activeRevision = await this.dataSource
      .getRepository(RecordPermissionRevisionEntity)
      .findOneBy({ workspaceId, status: 'active' });

    if (
      hasRecordPermissionConditionChanges(
        definition,
        activeRevision?.definition,
      ) &&
      (!featureFlagsMap[FeatureFlagKey.IS_ROW_LEVEL_SECURITY_ENABLED] ||
        !(await this.rowLevelPermissionPredicateService.hasRowLevelPermissionFeature(
          workspaceId,
        )))
    ) {
      throw new Error(
        'Conditional record permissions require row-level security and an enterprise entitlement',
      );
    }

    const revisionId = v4();
    const context = await this.loadContext(workspaceId, {
      id: revisionId,
      definition,
    });

    for (const object of definition.objects) {
      if (
        !isDefined(
          context.flatObjectMetadataMaps.byUniversalIdentifier[
            object.objectUniversalIdentifier
          ],
        ) ||
        context.flatObjectMetadataMaps.byUniversalIdentifier[
          object.objectUniversalIdentifier
        ]?.nameSingular === 'recordShare'
      ) {
        throw new Error(
          'Permission object does not exist or cannot receive a policy in this workspace',
        );
      }
    }
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );
    const referencedRoles = [
      ...(definition.defaults ?? []).map(
        (rule) => rule.roleUniversalIdentifier,
      ),
      ...definition.objects.flatMap(
        (object) => object.defaultOverrideRoleUniversalIdentifiers ?? [],
      ),
    ];
    if (
      referencedRoles.some(
        (identifier) =>
          !isDefined(flatRoleMaps.byUniversalIdentifier[identifier]),
      )
    ) {
      throw new Error('Permission role does not exist in this workspace');
    }
    await this.validateDefinition(workspaceId, context);
    await installRecordPermissionStorage({
      database: this.dataSource,
      schemaName: context.schemaName,
      metadata: context,
    });
    await installRecordPermissionPathIndexes({
      database: this.dataSource,
      context,
    });
    const groups = await this.buildAccessGroups(workspaceId, context);
    const schema = escapeIdentifier(context.schemaName);

    await this.dataSource.transaction(async (manager) => {
      await manager.query("SET LOCAL lock_timeout = '500ms'");
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [context.schemaName + ':record-permissions'],
      );
      const [state] = await manager.query(
        `SELECT * FROM ${schema}."recordPermissionState" WHERE id FOR UPDATE`,
      );

      if (
        state.activeRevisionId !== expectedActiveRevisionId ||
        isDefined(state.candidateRevisionId)
      ) {
        throw new Error(
          'Permissions changed while editing. Refresh before publishing another revision.',
        );
      }

      await manager.getRepository(RecordPermissionRevisionEntity).insert({
        id: revisionId,
        workspaceId,
        definition,
        status: 'building',
        previousRevisionId: expectedActiveRevisionId,
        failureReason: null,
      });
      await manager.query(
        `UPDATE ${schema}."recordPermissionState" SET "candidateRevisionId" = $1 WHERE id`,
        [revisionId],
      );
      for (const object of context.definition.objects) {
        const objectMetadata =
          context.flatObjectMetadataMaps.byUniversalIdentifier[
            object.objectUniversalIdentifier
          ];

        await manager.query(
          `INSERT INTO ${schema}."recordPermissionScan" ("revisionId", "objectMetadataId") VALUES ($1, $2)`,
          [revisionId, objectMetadata!.id],
        );
      }
      if (groups.length > 0) {
        await manager.query(
          `INSERT INTO ${schema}."recordPermissionAccessGroup" (id, "revisionId", definition) SELECT (definition->>'id')::uuid, $1::uuid, definition FROM jsonb_array_elements($2::jsonb) definition`,
          [revisionId, JSON.stringify(groups)],
        );
      }
    });

    return this.getState(workspaceId);
  }

  async cancelCandidate(workspaceId: string, revisionId: string) {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const schema = escapeIdentifier(schemaName);

    await this.dataSource.transaction(async (manager) => {
      await manager.query("SET LOCAL lock_timeout = '500ms'");
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [schemaName + ':record-permissions'],
      );
      const result = await manager.query(
        `WITH cancelled AS (UPDATE ${schema}."recordPermissionState" SET "candidateRevisionId" = NULL WHERE "candidateRevisionId" = $1 RETURNING id) SELECT id FROM cancelled`,
        [revisionId],
      );

      if (result.length === 0) {
        throw new Error('This candidate is no longer pending');
      }
      await manager
        .getRepository(RecordPermissionRevisionEntity)
        .update({ id: revisionId, workspaceId }, { status: 'cancelled' });
      for (const table of [
        'recordPermissionWork',
        'recordPermissionExpansion',
        'recordPermissionScan',
        'recordPermissionAccessGroup',
      ]) {
        await manager.query(
          `DELETE FROM ${schema}.${escapeIdentifier(table)} WHERE "revisionId" = $1`,
          [revisionId],
        );
      }
    });

    return this.getState(workspaceId);
  }

  async buildAccessGroups(
    workspaceId: string,
    context: RecordPermissionContext,
  ): Promise<RecordPermissionAccessGroup[]> {
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );
    const memberObject = Object.values(
      context.flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((object) => object?.nameSingular === 'workspaceMember');
    const members = !isDefined(memberObject)
      ? []
      : formatResult<
          NonNullable<RecordPermissionAuthority['workspaceMember']>[]
        >(
          await this.dataSource.query(
            `SELECT * FROM ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(memberObject))} WHERE "deletedAt" IS NULL`,
          ),
          memberObject,
          context.flatObjectMetadataMaps,
          context.flatFieldMetadataMaps,
        );
    const shareTargets: { objectMetadataId: string; principalId: string }[] =
      await this.dataSource.query(
        `SELECT DISTINCT "objectMetadataId", "principalId" FROM ${escapeIdentifier(context.schemaName)}."recordShare" WHERE "deletedAt" IS NULL`,
      );
    const shareTargetKeys = new Set(
      shareTargets.map(
        (share) => `${share.objectMetadataId}:${share.principalId}`,
      ),
    );
    const sharePrincipalIds = new Set(
      shareTargets.map((share) => share.principalId),
    );
    const groups = new Map<string, RecordPermissionAccessGroup>();

    for (const objectPolicy of context.definition.objects) {
      for (const rule of objectPolicy.rules) {
        const role =
          flatRoleMaps.byUniversalIdentifier[rule.roleUniversalIdentifier];

        if (!isDefined(role)) continue;
        const bindings = isRecordPermissionConditionMemberDependent(
          rule.condition,
        )
          ? members
          : rule.actions.includes('receive')
            ? members.filter((member) => sharePrincipalIds.has(member.id))
            : [];

        for (const workspaceMember of [undefined, ...bindings]) {
          const ruleGroups = resolveRecordPermissionAccessGroups({
            revisionId: context.revisionId,
            definition: context.definition,
            ruleUniversalIdentifier: rule.universalIdentifier,
            authority: {
              roleId: role.id,
              roleUniversalIdentifier: role.universalIdentifier,
              workspaceMember,
            },
            metadata: context,
          });

          for (const group of ruleGroups) {
            if (
              group.sharePrincipalIds === null ||
              group.sharePrincipalIds.some((principalId) =>
                shareTargetKeys.has(
                  `${context.flatObjectMetadataMaps.byUniversalIdentifier[group.sourceObjectUniversalIdentifier]?.id}:${principalId}`,
                ),
              )
            )
              groups.set(group.id, group);
          }
        }
      }
    }

    return [...groups.values()];
  }

  private async validateDefinition(
    workspaceId: string,
    context: RecordPermissionContext,
  ): Promise<void> {
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    const visit = (
      objectUniversalIdentifier: string,
      depth: number,
      visited: string[],
    ): void => {
      if (depth > 3 || visited.includes(objectUniversalIdentifier)) {
        throw new Error(
          'Combined inheritance must be acyclic and cannot exceed three relation fields',
        );
      }
      const object = context.definition.objects.find(
        (candidate) =>
          candidate.objectUniversalIdentifier === objectUniversalIdentifier,
      );

      for (const path of object?.inheritancePaths ?? []) {
        resolveRecordPermissionPath({
          path,
          targetObjectUniversalIdentifier: objectUniversalIdentifier,
          metadata: context,
        });
        visit(
          path.sourceObjectUniversalIdentifier,
          depth + path.fieldUniversalIdentifiers.length,
          [...visited, objectUniversalIdentifier],
        );
      }
    };

    for (const object of context.definition.objects) {
      if (
        !isDefined(
          context.flatObjectMetadataMaps.byUniversalIdentifier[
            object.objectUniversalIdentifier
          ],
        )
      ) {
        throw new Error('Permission object does not exist in this workspace');
      }
      visit(object.objectUniversalIdentifier, 0, []);
      for (const rule of object.rules) {
        const role =
          flatRoleMaps.byUniversalIdentifier[rule.roleUniversalIdentifier];

        if (!isDefined(role)) {
          throw new Error('Permission role does not exist in this workspace');
        }
        const groups = resolveRecordPermissionAccessGroups({
          revisionId: context.revisionId,
          definition: { version: 1, objects: [{ ...object, rules: [rule] }] },
          authority: {
            roleId: role.id,
            roleUniversalIdentifier: role.universalIdentifier,
          },
          metadata: context,
        });

        for (const group of groups) {
          for (const action of rule.actions) {
            compileRecordPermissionGroup({
              context,
              group,
              action,
              objectUniversalIdentifier: object.objectUniversalIdentifier,
              tableAlias: 'validationTarget',
            });
          }
        }
      }
    }
  }

  private async buildInitialDefinition(
    workspaceId: string,
  ): Promise<RecordPermissionPolicyDefinition> {
    const {
      flatObjectMetadataMaps,
      flatRoleMaps,
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMapsOrm,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatRoleMaps',
      'rolesPermissions',
      'roleIdsWithAllRecordsAccess',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMapsOrm',
    ]);

    const metadata = {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
    };

    return {
      version: 1,
      objects: Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter((object) => object.nameSingular !== 'recordShare')
        .map((object) => ({
          objectUniversalIdentifier: object.universalIdentifier,
          inheritancePaths:
            object.readability !== MetadataReadability.INHERITED
              ? []
              : resolveInheritedReadabilityParents({
                  flatObjectMetadata: object,
                  ...metadata,
                }).map((parent) => {
                  const field = findFlatEntityByIdInFlatEntityMaps({
                    flatEntityId: parent.fieldMetadataId,
                    flatEntityMaps: flatFieldMetadataMapsOrm,
                  });
                  const inverseField = isDefined(
                    field?.relationTargetFieldMetadataId,
                  )
                    ? findFlatEntityByIdInFlatEntityMaps({
                        flatEntityId: field.relationTargetFieldMetadataId,
                        flatEntityMaps: flatFieldMetadataMapsOrm,
                      })
                    : undefined;
                  const sourceObject =
                    parent.kind === 'column'
                      ? parent.parentFlatObjectMetadata
                      : parent.childFlatObjectMetadata;
                  if (!isDefined(inverseField))
                    throw new Error(
                      'An inherited permission is missing its inverse relation',
                    );
                  return {
                    universalIdentifier: v5(
                      `inheritance:${object.universalIdentifier}:${inverseField.universalIdentifier}`,
                      INITIAL_RULE_NAMESPACE,
                    ),
                    sourceObjectUniversalIdentifier:
                      sourceObject.universalIdentifier,
                    fieldUniversalIdentifiers: [
                      inverseField.universalIdentifier,
                    ],
                  };
                }),
          rules: Object.values(flatRoleMaps.byUniversalIdentifier)
            .filter(isDefined)
            .flatMap((role) => {
              const permissions = rolesPermissions[role.id]?.[object.id];
              const actions: RecordPermissionAction[] = [];

              if (
                permissions?.canReadObjectRecords &&
                object.readability === MetadataReadability.OPEN
              )
                actions.push('read');
              if (
                permissions?.canUpdateObjectRecords &&
                object.readability === MetadataReadability.OPEN
              )
                actions.push('update');
              if (
                permissions?.canSoftDeleteObjectRecords &&
                object.readability === MetadataReadability.OPEN
              )
                actions.push('softDelete');
              if (
                permissions?.canDestroyObjectRecords &&
                object.readability === MetadataReadability.OPEN
              )
                actions.push('destroy');
              if (roleIdsWithAllRecordsAccess.includes(role.id))
                actions.push('share');
              actions.push('receive');

              return [
                {
                  universalIdentifier: v5(
                    `${object.universalIdentifier}:${role.universalIdentifier}`,
                    INITIAL_RULE_NAMESPACE,
                  ),
                  label: 'Imported permissions',
                  roleUniversalIdentifier: role.universalIdentifier,
                  actions,
                  condition: importRecordPermissionCondition({
                    roleId: role.id,
                    objectMetadataId: object.id,
                    metadata,
                    predicates: flatRowLevelPermissionPredicateMaps,
                    groups: flatRowLevelPermissionPredicateGroupMaps,
                  }),
                },
              ];
            }),
        })),
    };
  }
}
