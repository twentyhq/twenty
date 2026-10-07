import { Injectable } from '@nestjs/common';

import { type UnreachableServerRouteRegistration } from 'src/engine/core-modules/server-route-trigger/types/unreachable-server-route-registration.type';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ServerRouteReachabilityService {
  constructor(
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
  ) {}

  // A server route only resolves through the owner workspace's copy of the same
  // resolver, so a route installed anywhere is unreachable when the owner lacks it
  async findUnreachableServerRouteRegistrations(): Promise<
    UnreachableServerRouteRegistration[]
  > {
    const rows = await this.logicFunctionRepository
      .createQueryBuilder('logicFunction')
      .innerJoin('logicFunction.application', 'application')
      .innerJoin('application.workspace', 'workspace')
      .innerJoin(
        'application.applicationRegistration',
        'applicationRegistration',
      )
      .select('applicationRegistration.id', 'applicationRegistrationId')
      .addSelect(
        'applicationRegistration.universalIdentifier',
        'universalIdentifier',
      )
      .addSelect('applicationRegistration.name', 'name')
      .addSelect(
        'COUNT(DISTINCT application.workspaceId)',
        'unreachableWorkspaceCount',
      )
      .where('logicFunction.serverRouteTriggerSettings IS NOT NULL')
      .andWhere('logicFunction.deletedAt IS NULL')
      .andWhere('application.deletedAt IS NULL')
      .andWhere('workspace.deletedAt IS NULL')
      .andWhere((queryBuilder) => {
        const ownerResolverQuery = queryBuilder
          .subQuery()
          .select('1')
          .from(LogicFunctionEntity, 'ownerResolver')
          .innerJoin('ownerResolver.application', 'ownerApplication')
          .where(
            'ownerApplication.applicationRegistrationId = applicationRegistration.id',
          )
          .andWhere(
            'ownerResolver.workspaceId = applicationRegistration.ownerWorkspaceId',
          )
          .andWhere(
            'ownerResolver.universalIdentifier = logicFunction.universalIdentifier',
          )
          .andWhere('ownerResolver.serverRouteTriggerSettings IS NOT NULL')
          .andWhere('ownerResolver.deletedAt IS NULL')
          .andWhere('ownerApplication.deletedAt IS NULL')
          .getQuery();

        return `NOT EXISTS ${ownerResolverQuery}`;
      })
      .groupBy('applicationRegistration.id')
      .getRawMany<{
        applicationRegistrationId: string;
        universalIdentifier: string;
        name: string;
        unreachableWorkspaceCount: string;
      }>();

    return rows.map((row) => ({
      ...row,
      unreachableWorkspaceCount: Number(row.unreachableWorkspaceCount),
    }));
  }
}
