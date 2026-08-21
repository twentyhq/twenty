import { registerEnumType } from '@nestjs/graphql';

export enum RunAgentMessageRole {
  user = 'user',
  assistant = 'assistant',
}

registerEnumType(RunAgentMessageRole, {
  name: 'RunAgentMessageRole',
});
