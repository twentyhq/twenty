import { registerEnumType } from '@nestjs/graphql';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

registerEnumType(AgentMessageRole, {
  name: 'AgentMessageRole',
  description: 'Role of a message in a chat thread',
});
