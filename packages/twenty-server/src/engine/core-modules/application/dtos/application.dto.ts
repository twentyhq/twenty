import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { AgentDTO } from 'src/engine/metadata-modules/agent/dtos/agent.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

@ObjectType('Application')
export class ApplicationDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  description: string;

  @Field(() => [AgentDTO])
  agents: AgentDTO[];

  @Field(() => [ServerlessFunctionDTO])
  serverlessFunctions: ServerlessFunctionDTO[];

  @Field(() => [ObjectMetadataDTO])
  objects: ObjectMetadataDTO[];
}
