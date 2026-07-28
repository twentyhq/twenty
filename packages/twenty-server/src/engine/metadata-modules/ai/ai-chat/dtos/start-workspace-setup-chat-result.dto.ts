import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';

@ObjectType('StartWorkspaceSetupChatResult')
export class StartWorkspaceSetupChatResultDTO {
  @Field(() => WorkspaceSetupChatOutcome)
  outcome: WorkspaceSetupChatOutcome;

  @Field(() => UUIDScalarType, { nullable: true })
  threadId: string | null;

  @Field(() => String, { nullable: true })
  streamId?: string | null;
}
