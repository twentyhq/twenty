import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationSummaryDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-summary.dto';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';
import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
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
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  logo?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  version?: string;

  @IsString()
  @Field()
  universalIdentifier: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  packageJsonChecksum?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  packageJsonFileId?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  yarnLockChecksum?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  yarnLockFileId?: string;

  @Field(() => GraphQLJSON)
  availablePackages: Record<string, string>;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  applicationRegistrationId?: string;

  @Field(() => Boolean)
  @IsBoolean()
  canBeUninstalled: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  defaultRoleId?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  settingsCustomTabFrontComponentId?: string;

  @IsOptional()
  @Field(() => RoleDTO, { nullable: true })
  defaultLogicFunctionRole?: RoleDTO;

  @Field(() => [AgentDTO])
  agents?: AgentDTO[];

  @Field(() => [FrontComponentDTO])
  frontComponents?: FrontComponentDTO[];

  @Field(() => [CommandMenuItemDTO])
  commandMenuItems?: CommandMenuItemDTO[];

  @Field(() => [LogicFunctionDTO])
  logicFunctions?: LogicFunctionDTO[];

  @Field(() => [ObjectMetadataDTO])
  objects?: ObjectMetadataDTO[];

  @Field(() => [ApplicationVariableEntityDTO])
  applicationVariables?: ApplicationVariableEntityDTO[];

  @IsOptional()
  @Field(() => ApplicationRegistrationSummaryDTO, { nullable: true })
  applicationRegistration?: ApplicationRegistrationSummaryDTO;
}
