import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RECORD_PERMISSION_ACTIONS } from 'twenty-shared/constants';
import {
  type RecordPermissionAction,
  type RecordPermissionExplanation,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordPermissionAuthority } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { compileRecordPermissionExplanation } from 'src/engine/core-modules/record-permission/utils/compile-record-permission-explanation.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type RecordTargetInput } from 'src/engine/metadata-modules/record-permissions/dtos/record-target.input';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordPermissionExplanationService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async explain({
    authContext,
    target,
    workspaceMemberId,
    action,
  }: {
    authContext: UserWorkspaceAuthContext;
    target: RecordTargetInput;
    workspaceMemberId: string;
    action: string;
  }): Promise<RecordPermissionExplanation> {
    if (!RECORD_PERMISSION_ACTIONS.includes(action as RecordPermissionAction))
      throw new BadRequestException('Unknown permission action');
    const permissionAction = action as RecordPermissionAction;
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const context = getWorkspaceContext().recordPermissionContext;
      if (!isDefined(context))
        throw new BadRequestException(
          'Record permission policies are not active',
        );
      const object = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: target.objectMetadataId,
        flatEntityMaps: context.flatObjectMetadataMaps,
      });
      if (!isDefined(object))
        throw new ForbiddenException('Record is not accessible');
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          object.nameSingular,
        );
      for (const requiredAction of ['read', 'share'] as const) {
        const allowedIds =
          await repository.findRecordIdsAllowedForRecordPermissionAction({
            recordIds: [target.recordId],
            action: requiredAction,
          });
        if (!allowedIds?.includes(target.recordId))
          throw new ForbiddenException(
            'Sharing permission is required to explain access',
          );
      }
      const memberObject = Object.values(
        context.flatObjectMetadataMaps.byUniversalIdentifier,
      ).find((metadata) => metadata?.nameSingular === 'workspaceMember');
      if (!isDefined(memberObject))
        throw new Error('Workspace member metadata is unavailable');
      const [subject] = await repository.executeRaw<{
        member: Record<string, unknown>;
        roleId: string;
        roleUniversalIdentifier: string;
      }>(
        `SELECT to_jsonb(member) AS member, role.id AS "roleId", role."universalIdentifier" AS "roleUniversalIdentifier" FROM ${escapeIdentifier(context.schemaName)}.${escapeIdentifier(computeObjectTargetTable(memberObject))} member JOIN core."userWorkspace" membership ON membership."userId" = member."userId" AND membership."workspaceId" = :workspaceId AND membership."deletedAt" IS NULL JOIN core."roleTarget" assignment ON assignment."userWorkspaceId" = membership.id AND assignment."workspaceId" = :workspaceId JOIN core.role ON role.id = assignment."roleId" AND role."workspaceId" = :workspaceId WHERE member.id = :workspaceMemberId AND member."deletedAt" IS NULL`,
        { workspaceId: authContext.workspace.id, workspaceMemberId },
      );
      if (!isDefined(subject))
        throw new BadRequestException('Workspace member has no active role');
      const authority: RecordPermissionAuthority = {
        roleId: subject.roleId,
        roleUniversalIdentifier: subject.roleUniversalIdentifier,
        workspaceMember: formatResult<
          NonNullable<RecordPermissionAuthority['workspaceMember']>
        >(
          subject.member,
          memberObject,
          context.flatObjectMetadataMaps,
          context.flatFieldMetadataMaps,
        ),
      };
      const subjectContext = {
        ...context,
        denyAll: false,
        authorities: [authority],
      };
      const { statement, sources } = compileRecordPermissionExplanation({
        context: subjectContext,
        action: permissionAction,
        objectUniversalIdentifier: object.universalIdentifier,
        recordId: target.recordId,
      });
      const [result] = await repository.executeRaw<{
        allowed: boolean;
        sourceIds: string[];
      }>(statement.sql, statement.parameters);
      const allowed = result?.allowed ?? false;
      const sourceIds = new Set(result?.sourceIds.slice(0, 100) ?? []);
      return {
        allowed,
        action: permissionAction,
        reason: allowed
          ? null
          : context.capabilitiesByObjectUniversalIdentifier[
                object.universalIdentifier
              ]?.[permissionAction] === false
            ? 'capability'
            : 'noGrant',
        sources: sources.filter((source) => sourceIds.has(source.id)),
        hasMoreSources: (result?.sourceIds.length ?? 0) > 100,
      };
    }, authContext);
  }
}
