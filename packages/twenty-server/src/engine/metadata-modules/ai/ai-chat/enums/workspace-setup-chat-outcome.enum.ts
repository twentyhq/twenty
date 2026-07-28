import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceSetupChatOutcome {
  STARTED = 'STARTED',
  ALREADY_STARTED = 'ALREADY_STARTED',
  UNAVAILABLE = 'UNAVAILABLE',
}

registerEnumType(WorkspaceSetupChatOutcome, {
  name: 'WorkspaceSetupChatOutcome',
});
