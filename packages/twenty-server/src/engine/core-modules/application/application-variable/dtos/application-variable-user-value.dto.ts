import { ObjectType, OmitType } from '@nestjs/graphql';

import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';

@ObjectType('ApplicationVariableUserValue')
export class ApplicationVariableUserValueDTO extends OmitType(
  ApplicationVariableEntityDTO,
  ['id', 'scope'] as const,
) {}
