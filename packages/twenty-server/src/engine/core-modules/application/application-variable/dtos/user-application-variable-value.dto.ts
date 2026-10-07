import { ObjectType, OmitType } from '@nestjs/graphql';

import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';

@ObjectType('UserApplicationVariableValue')
export class UserApplicationVariableValueDTO extends OmitType(
  ApplicationVariableEntityDTO,
  ['id', 'scope'] as const,
) {}
