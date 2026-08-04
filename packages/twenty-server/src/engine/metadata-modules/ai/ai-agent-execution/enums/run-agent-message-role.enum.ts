import { registerEnumType } from '@nestjs/graphql';

// Members are lowercase on purpose: the GraphQL enum serializes member names,
// and these must match the RunAgentMessage role literals shared with the SDK.
export enum RunAgentMessageRole {
  user = 'user',
  assistant = 'assistant',
}

registerEnumType(RunAgentMessageRole, {
  name: 'RunAgentMessageRole',
});
