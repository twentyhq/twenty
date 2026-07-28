import { registerEnumType } from '@nestjs/graphql';

// Members are lowercase on purpose: the GraphQL enum serializes member names,
// and these must match the WorkspaceSetupChatResult outcome literals shared
// with the frontend.
export enum WorkspaceSetupChatOutcome {
  started = 'started',
  alreadyStarted = 'alreadyStarted',
  unavailable = 'unavailable',
}

registerEnumType(WorkspaceSetupChatOutcome, {
  name: 'WorkspaceSetupChatOutcome',
});
