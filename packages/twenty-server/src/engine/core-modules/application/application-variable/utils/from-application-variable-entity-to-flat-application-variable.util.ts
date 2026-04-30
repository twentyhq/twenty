import { type ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type FlatApplicationVariable } from 'src/engine/core-modules/application/application-variable/types/flat-application-variable.type';

export const fromApplicationVariableEntityToFlatApplicationVariable = (
  entity: ApplicationVariableEntity,
): FlatApplicationVariable => ({
  id: entity.id,
  key: entity.key,
  value: entity.value,
  description: entity.description,
  isSecret: entity.isSecret,
  applicationId: entity.applicationId,
  workspaceId: entity.workspaceId,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});
