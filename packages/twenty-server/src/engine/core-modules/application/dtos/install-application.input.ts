import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';

import { ALL_METADATA_NAME, AllMetadataName } from 'twenty-shared/metadata';

registerEnumType(ALL_METADATA_NAME, {
  name: 'AllMetadataName',
});

@InputType()
export class WorkspaceMigrationDeleteActionInput {
  @Field(() => String)
  type: 'delete';

  @Field(() => ALL_METADATA_NAME)
  metadataName: AllMetadataName;

  @Field(() => String)
  universalIdentifier: string;
}

@InputType()
export class WorkspaceMigrationInput {
  @Field(() => [WorkspaceMigrationDeleteActionInput])
  actions: WorkspaceMigrationDeleteActionInput[];
}

@ArgsType()
export class InstallApplicationInput {
  @Field(() => WorkspaceMigrationInput)
  workspaceMigration: WorkspaceMigrationInput;
}
