import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { InteractiveConnectionAction } from 'src/engine/core-modules/application/connection-provider/dtos/interactive-connection-action.enum';

@InputType('ContinueInteractiveConnectionInput')
export class ContinueInteractiveConnectionInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  flowId: string;

  @IsEnum(InteractiveConnectionAction)
  @Field(() => InteractiveConnectionAction)
  action: InteractiveConnectionAction;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  values?: Record<string, unknown>;
}
