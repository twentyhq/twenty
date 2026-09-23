import { Injectable } from '@nestjs/common';

import { type ServerCronDispatch } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type ResolvedServerCronDispatch = ServerCronDispatch & {
  logicFunctionId: string;
};

@Injectable()
export class ServerCronDispatchTargetResolverService {
  constructor(
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
  ) {}

  async resolveDispatchTargets({
    applicationRegistrationId,
    dispatches,
  }: {
    applicationRegistrationId: string;
    dispatches: ServerCronDispatch[];
  }): Promise<{
    resolvedDispatches: ResolvedServerCronDispatch[];
    droppedDispatches: ServerCronDispatch[];
  }> {
    if (dispatches.length === 0) {
      return { resolvedDispatches: [], droppedDispatches: [] };
    }

    const workspaceIds = [
      ...new Set(dispatches.map((dispatch) => dispatch.workspaceId)),
    ];
    const targetUniversalIdentifiers = [
      ...new Set(
        dispatches.map(
          (dispatch) => dispatch.targetLogicFunctionUniversalIdentifier,
        ),
      ),
    ];

    const targetLogicFunctions = await this.logicFunctionRepository
      .createQueryBuilder('logicFunction')
      .innerJoin('logicFunction.application', 'application')
      .innerJoin(
        WorkspaceEntity,
        'workspace',
        'workspace.id = logicFunction.workspaceId',
      )
      .select([
        'logicFunction.id',
        'logicFunction.workspaceId',
        'logicFunction.universalIdentifier',
      ])
      .where('logicFunction.workspaceId IN (:...workspaceIds)', {
        workspaceIds,
      })
      .andWhere(
        'logicFunction.universalIdentifier IN (:...targetUniversalIdentifiers)',
        { targetUniversalIdentifiers },
      )
      .andWhere(
        'application.applicationRegistrationId = :applicationRegistrationId',
        {
          applicationRegistrationId,
        },
      )
      .andWhere('logicFunction.serverCronTriggerSettings IS NULL')
      .andWhere('logicFunction.serverRouteTriggerSettings IS NULL')
      .andWhere('workspace.activationStatus = :activationStatus', {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      })
      .getMany();

    const logicFunctionIdByDispatchKey = new Map(
      targetLogicFunctions.map((logicFunction) => [
        `${logicFunction.workspaceId}.${logicFunction.universalIdentifier}`,
        logicFunction.id,
      ]),
    );

    const resolvedDispatches: ResolvedServerCronDispatch[] = [];
    const droppedDispatches: ServerCronDispatch[] = [];

    for (const dispatch of dispatches) {
      const logicFunctionId = logicFunctionIdByDispatchKey.get(
        `${dispatch.workspaceId}.${dispatch.targetLogicFunctionUniversalIdentifier}`,
      );

      if (!isDefined(logicFunctionId)) {
        droppedDispatches.push(dispatch);
        continue;
      }

      resolvedDispatches.push({ ...dispatch, logicFunctionId });
    }

    return { resolvedDispatches, droppedDispatches };
  }
}
