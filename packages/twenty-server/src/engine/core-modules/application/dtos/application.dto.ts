import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/applicationVariable/dtos/application-variable.dto';
import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

@ObjectType('Application')
export class ApplicationDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsOptional()
  @IsString()
  @Field()
  description?: string;

  @IsOptional()
  @IsString()
  @Field()
  version?: string;

  @IsString()
  @Field()
  universalIdentifier: string;

  @Field(() => Boolean)
  @IsBoolean()
  canBeUninstalled: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  defaultServerlessFunctionRoleId?: string;

  @IsOptional()
  @Field(() => RoleDTO, { nullable: true })
  defaultServerlessFunctionRole?: RoleDTO;

  @Field(() => [AgentDTO])
  agents?: AgentDTO[];

  @Field(() => [ServerlessFunctionDTO])
  serverlessFunctions?: ServerlessFunctionDTO[];

  @Field(() => [ObjectMetadataDTO])
  objects?: ObjectMetadataDTO[];

  @Field(() => [ApplicationVariableEntityDTO])
  applicationVariables?: ApplicationVariableEntityDTO[];
}
