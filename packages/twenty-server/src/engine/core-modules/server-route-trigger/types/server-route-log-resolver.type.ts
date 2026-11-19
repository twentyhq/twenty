import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export type ServerRouteLogResolver = Pick<
  LogicFunctionEntity,
  'id' | 'name' | 'workspaceId' | 'applicationId'
> & { application?: Pick<ApplicationEntity, 'version'> };
