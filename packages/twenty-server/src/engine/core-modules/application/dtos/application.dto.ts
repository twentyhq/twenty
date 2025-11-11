import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/applicationVariable/dtos/application-variable.dto';
import { AgentDTO } from 'src/engine/metadata-modules/agent/dtos/agent.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';

@ObjectType('Application')
export class ApplicationDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  description: string;

  @IsString()
  @Field()
  version: string;

  @Field(() => [AgentDTO])
  agents: AgentDTO[];

  @Field(() => [ServerlessFunctionDTO])
  serverlessFunctions: ServerlessFunctionDTO[];

  @Field(() => [ObjectMetadataDTO])
  objects: ObjectMetadataDTO[];

  @Field(() => [ApplicationVariableEntityDTO])
  applicationVariables: ApplicationVariableEntityDTO[];

  @IsString()
  @Field()
  universalIdentifier: string;
}
