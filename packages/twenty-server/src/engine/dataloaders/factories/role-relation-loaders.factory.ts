import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import DataLoader from 'dataloader';
import groupBy from 'lodash.groupby';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { fromFlatAgentWithRoleIdToAgentDto } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-agent-dto.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type ApiKeyForRoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { type RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { type RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type RoleRelationLoaderPayload = {
  workspaceId: string;
  roleId: string;
};

export type RowLevelPermissionsByRole = {
  rowLevelPermissionPredicates: RowLevelPermissionPredicateDTO[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroupDTO[];
};

export type RoleRelationLoaders = {
  workspaceMembersByRoleIdLoader: DataLoader<
    RoleRelationLoaderPayload,
    FlatWorkspaceMember[]
  >;
  agentsByRoleIdLoader: DataLoader<RoleRelationLoaderPayload, AgentDTO[]>;
  apiKeysByRoleIdLoader: DataLoader<
    RoleRelationLoaderPayload,
    ApiKeyForRoleDTO[]
  >;
  rowLevelPermissionsByRoleIdLoader: DataLoader<
    RoleRelationLoaderPayload,
    RowLevelPermissionsByRole
  >;
};

const sortByPositionInRowLevelPermissionPredicateGroup = <
  TItem extends { positionInRowLevelPermissionPredicateGroup?: number | null },
>(
  items: TItem[],
): TItem[] =>
  [...items].sort(
    (itemA, itemB) =>
      (itemA.positionInRowLevelPermissionPredicateGroup ?? 0) -
      (itemB.positionInRowLevelPermissionPredicateGroup ?? 0),
  );

@Injectable()
export class RoleRelationLoadersFactory {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  create(): RoleRelationLoaders {
    return {
      workspaceMembersByRoleIdLoader: new DataLoader<
        RoleRelationLoaderPayload,
        FlatWorkspaceMember[]
      >((payloads) => this.loadWorkspaceMembersByRoleId(payloads)),
      agentsByRoleIdLoader: new DataLoader<
        RoleRelationLoaderPayload,
        AgentDTO[]
      >((payloads) => this.loadAgentsByRoleId(payloads)),
      apiKeysByRoleIdLoader: new DataLoader<
        RoleRelationLoaderPayload,
        ApiKeyForRoleDTO[]
      >((payloads) => this.loadApiKeysByRoleId(payloads)),
      rowLevelPermissionsByRoleIdLoader: new DataLoader<
        RoleRelationLoaderPayload,
        RowLevelPermissionsByRole
      >((payloads) => this.loadRowLevelPermissionsByRoleId(payloads)),
    };
  }

  private async getFlatRoleTargetsByRoleId(
    workspaceId: string,
  ): Promise<Partial<Record<string, FlatRoleTarget[]>>> {
    const { flatRoleTargetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetMaps',
      ]);

    return groupBy(
      Object.values(flatRoleTargetMaps.byUniversalIdentifier).filter(isDefined),
      (flatRoleTarget) => flatRoleTarget.roleId,
    );
  }

  private async loadWorkspaceMembersByRoleId(
    payloads: readonly RoleRelationLoaderPayload[],
  ): Promise<FlatWorkspaceMember[][]> {
    const workspaceId = payloads[0].workspaceId;

    const [flatRoleTargetsByRoleId, { flatWorkspaceMemberMaps }] =
      await Promise.all([
        this.getFlatRoleTargetsByRoleId(workspaceId),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkspaceMemberMaps',
        ]),
      ]);

    const userWorkspaceIdsByRoleId = new Map(
      payloads.map(({ roleId }) => [
        roleId,
        (flatRoleTargetsByRoleId[roleId] ?? [])
          .map((flatRoleTarget) => flatRoleTarget.userWorkspaceId)
          .filter(isDefined),
      ]),
    );

    const allUserWorkspaceIds = [
      ...new Set([...userWorkspaceIdsByRoleId.values()].flat()),
    ];

    const userWorkspaces =
      allUserWorkspaceIds.length > 0
        ? await this.userWorkspaceRepository.find({
            select: { id: true, userId: true },
            where: { id: In(allUserWorkspaceIds), workspaceId },
          })
        : [];

    const userIdByUserWorkspaceId = new Map(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.id,
        userWorkspace.userId,
      ]),
    );

    return payloads.map(({ roleId }) =>
      (userWorkspaceIdsByRoleId.get(roleId) ?? [])
        .map((userWorkspaceId) => {
          const userId = userIdByUserWorkspaceId.get(userWorkspaceId);
          const workspaceMemberId = isDefined(userId)
            ? flatWorkspaceMemberMaps.idByUserId[userId]
            : undefined;

          return isDefined(workspaceMemberId)
            ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
            : undefined;
        })
        .filter(isDefined)
        .filter((workspaceMember) => !isDefined(workspaceMember.deletedAt)),
    );
  }

  private async loadAgentsByRoleId(
    payloads: readonly RoleRelationLoaderPayload[],
  ): Promise<AgentDTO[][]> {
    const workspaceId = payloads[0].workspaceId;

    const [flatRoleTargetsByRoleId, { flatAgentMaps }] = await Promise.all([
      this.getFlatRoleTargetsByRoleId(workspaceId),
      this.workspaceCacheService.getOrRecompute(workspaceId, ['flatAgentMaps']),
    ]);

    return payloads.map(({ roleId }) =>
      (flatRoleTargetsByRoleId[roleId] ?? [])
        .map((flatRoleTarget) =>
          isDefined(flatRoleTarget.agentId)
            ? findFlatEntityByIdInFlatEntityMaps({
                flatEntityId: flatRoleTarget.agentId,
                flatEntityMaps: flatAgentMaps,
              })
            : undefined,
        )
        .filter(isDefined)
        .filter((flatAgent) => !isDefined(flatAgent.deletedAt))
        .map((flatAgent) =>
          fromFlatAgentWithRoleIdToAgentDto({ ...flatAgent, roleId }),
        ),
    );
  }

  private async loadApiKeysByRoleId(
    payloads: readonly RoleRelationLoaderPayload[],
  ): Promise<ApiKeyForRoleDTO[][]> {
    const workspaceId = payloads[0].workspaceId;

    const [flatRoleTargetsByRoleId, { apiKeyMap }] = await Promise.all([
      this.getFlatRoleTargetsByRoleId(workspaceId),
      this.workspaceCacheService.getOrRecompute(workspaceId, ['apiKeyMap']),
    ]);

    return payloads.map(({ roleId }) =>
      (flatRoleTargetsByRoleId[roleId] ?? [])
        .map((flatRoleTarget) =>
          isDefined(flatRoleTarget.apiKeyId)
            ? apiKeyMap[flatRoleTarget.apiKeyId]
            : undefined,
        )
        .filter(isDefined)
        .filter((flatApiKey) => !isDefined(flatApiKey.revokedAt))
        .map((flatApiKey) => ({
          id: flatApiKey.id,
          name: flatApiKey.name,
          expiresAt: new Date(flatApiKey.expiresAt),
          revokedAt: null,
        })),
    );
  }

  private async loadRowLevelPermissionsByRoleId(
    payloads: readonly RoleRelationLoaderPayload[],
  ): Promise<RowLevelPermissionsByRole[]> {
    const workspaceId = payloads[0].workspaceId;

    const hasRowLevelPermissionFeature =
      await this.rowLevelPermissionPredicateService.hasRowLevelPermissionFeature(
        workspaceId,
      );

    if (!hasRowLevelPermissionFeature) {
      return payloads.map(() => ({
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      }));
    }

    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);

    const activePredicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((predicate) => predicate.deletedAt === null);

    const activePredicateGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((predicateGroup) => predicateGroup.deletedAt === null);

    const predicatesByRoleId = groupBy(
      sortByPositionInRowLevelPermissionPredicateGroup(activePredicates),
      (predicate) => predicate.roleId,
    );

    const predicateGroupsByRoleId = groupBy(
      sortByPositionInRowLevelPermissionPredicateGroup(activePredicateGroups),
      (predicateGroup) => predicateGroup.roleId,
    );

    return payloads.map(({ roleId }) => ({
      rowLevelPermissionPredicates: (predicatesByRoleId[roleId] ?? []).map(
        fromFlatRowLevelPermissionPredicateToDto,
      ),
      rowLevelPermissionPredicateGroups: (
        predicateGroupsByRoleId[roleId] ?? []
      ).map(fromFlatRowLevelPermissionPredicateGroupToDto),
    }));
  }
}
