import { type SelectQueryBuilder } from 'typeorm';

import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const createServerRouteResolverQueryBuilder = (
  logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
): SelectQueryBuilder<LogicFunctionEntity> =>
  logicFunctionRepository
    .createQueryBuilder('logicFunction')
    .innerJoinAndSelect('logicFunction.application', 'application')
    .innerJoinAndSelect(
      'application.applicationRegistration',
      'applicationRegistration',
    )
    .where('logicFunction.serverRouteTriggerSettings IS NOT NULL')
    .andWhere(
      'logicFunction.workspaceId = applicationRegistration.ownerWorkspaceId',
    );
