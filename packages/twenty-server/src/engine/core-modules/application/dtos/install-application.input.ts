import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ALL_METADATA_NAME, AllMetadataName } from 'twenty-shared/metadata';

import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

registerEnumType(ALL_METADATA_NAME, {
  name: 'AllMetadataName',
});

registerEnumType(WORKSPACE_MIGRATION_ACTION_TYPE, {
  name: 'WorkspaceMigrationActionType',
});

@InputType()
export class WorkspaceMigrationDeleteActionInput {
  @Field(() => WORKSPACE_MIGRATION_ACTION_TYPE)
  @IsEnum(WORKSPACE_MIGRATION_ACTION_TYPE)
  type: 'delete';

  @Field(() => ALL_METADATA_NAME)
  @IsEnum(ALL_METADATA_NAME)
  metadataName: AllMetadataName;

  @Field(() => String)
  @IsUUID()
  universalIdentifier: string;
}

@InputType()
export class WorkspaceMigrationInput {
  @Field(() => [WorkspaceMigrationDeleteActionInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkspaceMigrationDeleteActionInput)
  actions: WorkspaceMigrationDeleteActionInput[];
}

@ArgsType()
export class InstallApplicationInput {
  @Field(() => WorkspaceMigrationInput)
  @ValidateNested()
  @Type(() => WorkspaceMigrationInput)
  workspaceMigration: WorkspaceMigrationInput;
}
