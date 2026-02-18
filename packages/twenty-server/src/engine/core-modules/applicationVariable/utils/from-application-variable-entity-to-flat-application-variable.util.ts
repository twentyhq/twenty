import { type ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { type FlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/types/flat-application-variable.type';

export const fromApplicationVariableEntityToFlatApplicationVariable = (
  entity: ApplicationVariableEntity,
): FlatApplicationVariable => ({
  id: entity.id,
  key: entity.key,
  value: entity.value,
  description: entity.description,
  isSecret: entity.isSecret,
  applicationId: entity.applicationId,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});
