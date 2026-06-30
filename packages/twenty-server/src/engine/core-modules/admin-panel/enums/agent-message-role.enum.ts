import { registerEnumType } from '@nestjs/graphql';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

registerEnumType(AgentMessageRole, {
  name: 'AgentMessageRole',
  description: 'Role of a message in a chat thread',
});
