import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordPermissionAuthority } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { evaluateRecordPermissionRoleAccess } from 'src/engine/core-modules/record-permission/utils/evaluate-record-permission-role-access.util';
import { getRecordPermissionRoleDefinition } from 'src/engine/core-modules/record-permission/utils/get-record-permission-role-definition.util';
import { isRecordPermissionConditionMemberDependent } from 'src/engine/core-modules/record-permission/utils/is-record-permission-condition-member-dependent.util';
import { type RecordSharingRoleDTO } from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordPermissionRoleAccessService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async summarize({
    authContext,
    object,
    recordId,
  }: {
    authContext: UserWorkspaceAuthContext;
    object: FlatObjectMetadata;
    recordId: string;
  }): Promise<RecordSharingRoleDTO[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const context = getWorkspaceContext().recordPermissionContext;
      if (!isDefined(context)) return [];
      const memberObject = Object.values(
        context.flatObjectMetadataMaps.byUniversalIdentifier,
      ).find((metadata) => metadata?.nameSingular === 'workspaceMember');
      if (!isDefined(memberObject))
        throw new Error('Workspace member metadata is unavailable');

      return this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transaction) => {
          const repository = transaction.getRepository(object.nameSingular);
          for (const action of ['read', 'share'] as const) {
            const allowedIds =
              await repository.findRecordIdsAllowedForRecordPermissionAction({
                recordIds: [recordId],
                action,
              });
            if (!allowedIds?.includes(recordId)) return [];
          }
          const subjects = (await transaction.executeRawQuery(
            `SELECT role.id AS "roleId", role."universalIdentifier" AS "roleUniversalIdentifier", role.label, to_jsonb(member) AS member FROM core.role
          LEFT JOIN core."roleTarget" assignment ON assignment."roleId" = role.id AND assignment."workspaceId" = role."workspaceId" AND assignment."userWorkspaceId" IS NOT NULL
          LEFT JOIN core."userWorkspace" membership ON membership.id = assignment."userWorkspaceId" AND membership."workspaceId" = role."workspaceId" AND membership."deletedAt" IS NULL
          LEFT JOIN ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(memberObject))} member ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
          WHERE role."workspaceId" = $1`,
            [authContext.workspace.id],
          )) as {
            roleId: string;
            roleUniversalIdentifier: string;
            label: string;
            member: Record<string, unknown> | null;
          }[];
          const memberDependentRoles = new Set(
            getRecordPermissionRoleDefinition(
              context.definition,
              object.universalIdentifier,
            ).objects.flatMap((policy) =>
              policy.rules
                .filter((rule) =>
                  isRecordPermissionConditionMemberDependent(rule.condition),
                )
                .map((rule) => rule.roleUniversalIdentifier),
            ),
          );
          const populatedRoles = new Set(
            subjects
              .filter((subject) => isDefined(subject.member))
              .map((subject) => subject.roleId),
          );
          const selectedSubjects = new Map(
            subjects
              .filter(
                (subject) =>
                  isDefined(subject.member) ||
                  !populatedRoles.has(subject.roleId),
              )
              .map((subject) => [
                memberDependentRoles.has(subject.roleUniversalIdentifier)
                  ? `${subject.roleId}:${subject.member?.id ?? ''}`
                  : subject.roleId,
                subject,
              ]),
          );
          const authorities: RecordPermissionAuthority[] = [
            ...selectedSubjects.values(),
          ].map((subject) => ({
            roleId: subject.roleId,
            roleUniversalIdentifier: subject.roleUniversalIdentifier,
            workspaceMember: isDefined(subject.member)
              ? formatResult<
                  NonNullable<RecordPermissionAuthority['workspaceMember']>
                >(
                  subject.member,
                  memberObject,
                  context.flatObjectMetadataMaps,
                  context.flatFieldMetadataMaps,
                )
              : undefined,
          }));
          const accessByRole = await evaluateRecordPermissionRoleAccess({
            database: {
              query: (sql, parameters) =>
                transaction.executeRawQuery(sql, parameters),
            },
            context,
            objectUniversalIdentifier: object.universalIdentifier,
            recordId,
            authorities,
          });
          const roles = new Map(
            subjects.map((subject) => [subject.roleId, subject]),
          );
          return [...roles.values()].map(({ roleId, label }) => ({
            id: roleId,
            label,
            canRead: false,
            canUpdate: false,
            ...accessByRole.get(roleId),
          }));
        },
      );
    }, authContext);
  }
}
