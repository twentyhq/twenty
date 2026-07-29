import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { type RunAgentInput } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('RunAgentInput')
export class RunAgentInputDTO implements RunAgentInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  agentUniversalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  prompt: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  runAsWorkspaceMemberId?: string;
}
