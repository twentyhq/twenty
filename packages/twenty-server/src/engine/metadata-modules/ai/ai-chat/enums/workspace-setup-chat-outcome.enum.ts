import { registerEnumType } from '@nestjs/graphql';

// Members are lowercase on purpose: the GraphQL enum serializes member names,
// and the frontend switches on the generated enum built from them.
export enum WorkspaceSetupChatOutcome {
  started = 'started',
  alreadyStarted = 'alreadyStarted',
  unavailable = 'unavailable',
}

registerEnumType(WorkspaceSetupChatOutcome, {
  name: 'WorkspaceSetupChatOutcome',
});
