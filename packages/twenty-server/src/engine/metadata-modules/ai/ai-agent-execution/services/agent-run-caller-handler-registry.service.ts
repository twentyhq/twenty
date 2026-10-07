import { Injectable } from '@nestjs/common';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { HandlerRegistry } from 'src/engine/utils/handler-registry';

@Injectable()
export class AgentRunCallerHandlerRegistryService extends HandlerRegistry<
  AgentRunCaller['type'],
  AgentRunCallerHandler
> {}
