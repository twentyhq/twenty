/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { isRecordGrantBeyondRoleAllowed } from 'src/engine/core-modules/record-share/utils/is-record-grant-beyond-role-allowed.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type RecordSharePrincipal = Pick<
  RecordShareInput,
  'principalId' | 'principalType'
>;

@Injectable()
export class RecordSharePrincipalService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  // Undefined for everyone, and for a member who left or whose membership is gone
  async resolveRoleIds({
    workspaceId,
    principals,
  }: {
    workspaceId: string;
    principals: RecordSharePrincipal[];
  }): Promise<(string | undefined)[]> {
    const { flatWorkspaceMemberMaps, userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'userWorkspaceRoleMap',
      ]);
    const userIdByWorkspaceMemberId = new Map(
      principals
        .filter(
          (principal) =>
            principal.principalType ===
            RecordSharePrincipalType.WORKSPACE_MEMBER,
        )
        .map((principal) => {
          const flatWorkspaceMember =
            flatWorkspaceMemberMaps.byId[principal.principalId];

          return [
            principal.principalId,
            isDefined(flatWorkspaceMember?.deletedAt)
              ? undefined
              : flatWorkspaceMember?.userId,
          ];
        })
        .filter((entry): entry is [string, string] => isDefined(entry[1])),
    );
    // Members are cached without their user workspace, which holds the role
    const userWorkspaces =
      userIdByWorkspaceMemberId.size > 0
        ? await this.userWorkspaceRepository.find({
            select: ['id', 'userId'],
            where: {
              workspaceId,
              userId: In([...userIdByWorkspaceMemberId.values()]),
            },
          })
        : [];
    const roleIdByUserId = new Map(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.userId,
        userWorkspaceRoleMap[userWorkspace.id],
      ]),
    );

    return principals.map((principal) => {
      switch (principal.principalType) {
        case RecordSharePrincipalType.ROLE:
          return principal.principalId;
        case RecordSharePrincipalType.WORKSPACE_MEMBER: {
          const userId = userIdByWorkspaceMemberId.get(principal.principalId);

          return isDefined(userId) ? roleIdByUserId.get(userId) : undefined;
        }
        default:
          return undefined;
      }
    });
  }

  // Without reach beyond roles, a grant the recipient's role cannot use would
  // be stored without ever taking effect. Runs after the grants are written:
  // they satisfy the share gate, so only the role and its row filter are tested
  async assertPrincipalsReachRecordsOrThrow({
    workspaceId,
    transactionScope,
    flatObjectMetadata,
    isRecordSharingEnabled,
    principals,
    recordIds,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    flatObjectMetadata: FlatObjectMetadata;
    isRecordSharingEnabled: boolean;
    principals: RecordSharePrincipal[];
    recordIds: string[];
  }): Promise<void> {
    const namedPrincipals = principals.filter(
      (principal) =>
        principal.principalType !== RecordSharePrincipalType.EVERYONE,
    );

    if (
      namedPrincipals.length === 0 ||
      recordIds.length === 0 ||
      isRecordGrantBeyondRoleAllowed({
        flatObjectMetadata,
        operationType: 'select',
        isRecordSharingEnabled,
      })
    ) {
      return;
    }

    const roleIds = await this.resolveRoleIds({
      workspaceId,
      principals: namedPrincipals,
    });
    const {
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'rolesPermissions',
      'roleIdsWithAllRecordsAccess',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
    ]);
    const repository = transactionScope.getRepository(
      flatObjectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );

    for (const [index, principal] of namedPrincipals.entries()) {
      const roleId = roleIds[index];

      if (!isDefined(roleId)) {
        continue;
      }

      const roleObjectsPermissions = rolesPermissions[roleId];

      if (
        isDefined(roleObjectsPermissions) &&
        !(
          roleObjectsPermissions[flatObjectMetadata.id]?.canReadObjectRecords ??
          false
        )
      ) {
        throw new RecordShareException(
          `Principal ${principal.principalId} cannot access ${flatObjectMetadata.nameSingular} records through its role`,
          RecordShareExceptionCode.INVALID_SHARE_WITH,
          {
            userFriendlyMessage: msg`Their role cannot access these records, and this object is only shared with roles that can.`,
          },
        );
      }

      // A role's row filter can depend on which member reads, so a share with
      // a role is only held to object access here and filtered per member on read
      if (principal.principalType === RecordSharePrincipalType.ROLE) {
        continue;
      }

      const workspaceMember = await transactionScope
        .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
          shouldBypassPermissionChecks: true,
        })
        .findOne({ where: { id: principal.principalId } });
      const roleSubject = buildRoleRowAccessPolicySubject({
        roleId,
        owningApplicationId: undefined,
        rolesPermissions,
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        workspaceMember: workspaceMember ?? undefined,
      });
      const policy = repository.buildRowAccessPolicy({
        subject: {
          ...roleSubject,
          principalIds: [
            ...(roleSubject.principalIds ?? []),
            principal.principalId,
          ],
        },
        operationType: 'select',
      });
      const reachableRecordIds =
        await repository.findRecordIdsAdmittedByRowAccessPolicy({
          recordIds,
          policy,
        });
      const unreachableRecordId = recordIds.find(
        (recordId) => !reachableRecordIds.has(recordId),
      );

      if (isDefined(unreachableRecordId)) {
        throw new RecordShareException(
          `Principal ${principal.principalId} cannot see record ${unreachableRecordId} through its role`,
          RecordShareExceptionCode.INVALID_SHARE_WITH,
          {
            userFriendlyMessage: msg`Their role cannot see this record, and this object is only shared with people who can.`,
          },
        );
      }
    }
  }
}
